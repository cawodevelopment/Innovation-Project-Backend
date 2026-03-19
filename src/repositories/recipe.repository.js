import prisma from '../utils/client.js';
import axios from 'axios';
import HttpError from '../errors/http.error.js';

const recipeSelect = {
    id: true,
    title: true,
    status: true,
    instructions: true,
    ingredients: true,
    allergenNotices: true,
    prepTimeInMinutes: true,
    cookingTimeInMinutes: true,
    servings: true,
    dietaryRestrictions: true,
    difficulty: true,
    ratingOutOf5: true,
    nutritionInfo: {
        select: {
            caloriesKcal: true,
            proteinG: true,
            carbsG: true,
            fatG: true
        }
    }
};

const tryParseJson = (value) => {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const parseCandidate = (candidate) => {
        try {
            return JSON.parse(candidate);
        } catch {
            return null;
        }
    };

    const direct = parseCandidate(trimmed);
    if (direct !== null) {
        return direct;
    }

    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced?.[1]) {
        return parseCandidate(fenced[1].trim());
    }

    return null;
};

const parseRecipes = (data, seen = new Set()) => {
    const looksLikeRecipe = (value) =>
        value && typeof value === 'object' && ('title' in value || 'ingredients' in value || 'instructions' in value);

    if (typeof data === 'string') {
        const parsed = tryParseJson(data);
        if (parsed !== null) {
            return parseRecipes(parsed, seen);
        }

        return null;
    }

    if (!data || typeof data !== 'object') {
        return null;
    }

    if (seen.has(data)) {
        return null;
    }

    seen.add(data);

    if (Array.isArray(data)) {
        if (data.every(looksLikeRecipe)) {
            return data;
        }

        for (const item of data) {
            const nested = parseRecipes(item, seen);
            if (nested?.length) {
                return nested;
            }
        }

        return null;
    }

    if (looksLikeRecipe(data)) {
        return [data];
    }

    const commonContainers = [
        data.data,
        data.recipes,
        data.recipe,
        data.output,
        data.result,
        data.response,
        data.payload,
        data.body,
        data.content,
        data.text,
        data.message
    ];

    for (const container of commonContainers) {
        if (container !== undefined) {
            const nested = parseRecipes(container, seen);
            if (nested?.length) {
                return nested;
            }
        }
    }

    if (Array.isArray(data.choices)) {
        for (const choice of data.choices) {
            const nested = parseRecipes(choice?.message?.content ?? choice?.text ?? choice, seen);
            if (nested?.length) {
                return nested;
            }
        }
    }

    for (const value of Object.values(data)) {
        const nested = parseRecipes(value, seen);
        if (nested?.length) {
            return nested;
        }
    }

    return null;
};

const splitCsv = (value) => {
    if (value === undefined || value === null || value === '') return undefined;

    const list = (Array.isArray(value) ? value : [value])
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

    return list.length ? list : undefined;
};

const toNumber = (value, { min, max, integer = false } = {}) => {
    if (value === undefined || value === null || value === '') return undefined;

    const parsed = Number(value);
    if (Number.isNaN(parsed)) return undefined;
    if (integer && !Number.isInteger(parsed)) return undefined;
    if (min !== undefined && parsed < min) return undefined;
    if (max !== undefined && parsed > max) return undefined;

    return parsed;
};

const toStringArray = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [String(value).trim()].filter(Boolean);
};

const toIntOrDefault = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.round(parsed);
};

export const getUserDietaryData = async (userId) => {
    const [dietaryPreferences, allergens] = await Promise.all([
        prisma.userDietaryPreference.findMany({
            where: { userId },
            select: {
                dietaryPreference: {
                    select: { name: true }
                }
            }
        }),
        prisma.userAllergen.findMany({
            where: { userId },
            select: {
                allergen: {
                    select: { name: true }
                }
            }
        })
    ]);

    return {
        dietaryPreferences: dietaryPreferences.map((pref) => pref.dietaryPreference.name),
        allergens: allergens.map((allergen) => allergen.allergen.name)
    };
};

export const generateRecipeDrafts = async (userId, inputData) => {
    try {
        const { data } = await axios.post(process.env.N8N_WEBHOOK_URL_GENERATION, inputData);
        const recipes = parseRecipes(data);

        if (!recipes) {
            const keys = data && typeof data === 'object' && !Array.isArray(data)
                ? Object.keys(data).slice(0, 8).join(', ')
                : typeof data;
            throw new HttpError(502, `Unexpected generation response: recipes not found (received: ${keys || 'empty'})`);
        }

        const drafts = recipes.map((r) => ({
            userId,
            title: r.title ? String(r.title) : 'Untitled Recipe',
            status: 'DRAFT',
            instructions: toStringArray(r.instructions),
            ingredients: toStringArray(r.ingredients),
            allergenNotices: toStringArray(r.allergenNotices),
            prepTimeInMinutes: toIntOrDefault(r.prepTimeInMinutes, 0),
            cookingTimeInMinutes: toIntOrDefault(r.cookingTimeInMinutes, 0),
            servings: toIntOrDefault(r.servings, 1),
            dietaryRestrictions: toStringArray(r.dietaryRestrictions),
            difficulty: r.difficulty ? String(r.difficulty) : 'unknown',
            ratingOutOf5: toIntOrDefault(r.ratingOutOf5, 0),
            nutritionInfo: {
                create: {
                    caloriesKcal: toIntOrDefault(r.nutritionInfo?.caloriesKcal, 0),
                    proteinG: toIntOrDefault(r.nutritionInfo?.proteinG, 0),
                    carbsG: toIntOrDefault(r.nutritionInfo?.carbsG, 0),
                    fatG: toIntOrDefault(r.nutritionInfo?.fatG, 0)
                }
            }
        }));

        const [, ...created] = await prisma.$transaction([
            prisma.recipe.deleteMany({ where: { userId, status: 'DRAFT' } }),
            ...drafts.map((draft) => prisma.recipe.create({ data: draft, select: recipeSelect }))
        ]);

        return created;
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }

        if (axios.isAxiosError(error)) {
            const upstreamMessage =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message ||
                'Recipe generation upstream request failed';
            throw new HttpError(502, `Recipe generation failed: ${upstreamMessage}`);
        }

        if (error instanceof Error) {
            throw new HttpError(500, `Recipe generation failed: ${error.message}`);
        }

        throw new HttpError(500, 'Recipe generation failed');
    }
};

export const getAllRecipes = async (userId, filters = {}) => {
    const safeFilters = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};

    const normalized = {
        difficulty: safeFilters.difficulty ? String(safeFilters.difficulty).trim() : undefined,
        minPrepTimeInMinutes: toNumber(safeFilters.minPrepTimeInMinutes, { min: 0, integer: true }),
        maxPrepTimeInMinutes: toNumber(safeFilters.maxPrepTimeInMinutes, { min: 0, integer: true }),
        minCookingTimeInMinutes: toNumber(safeFilters.minCookingTimeInMinutes, { min: 0, integer: true }),
        maxCookingTimeInMinutes: toNumber(safeFilters.maxCookingTimeInMinutes, { min: 0, integer: true }),
        minServings: toNumber(safeFilters.minServings, { min: 1, integer: true }),
        maxServings: toNumber(safeFilters.maxServings, { min: 1, integer: true }),
        minRating: toNumber(safeFilters.minRating, { min: 0, max: 5 }),
        maxRating: toNumber(safeFilters.maxRating, { min: 0, max: 5 }),
        dietaryPreferences: splitCsv(safeFilters.dietaryPreferences),
        excludeAllergens: splitCsv(safeFilters.excludeAllergens)
    };

    const where = {
        userId,
        status: 'PUBLISHED'
    };

    if (normalized.difficulty) {
        where.difficulty = {
            equals: normalized.difficulty,
            mode: 'insensitive'
        };
    }

    if (
        normalized.minPrepTimeInMinutes !== undefined ||
        normalized.maxPrepTimeInMinutes !== undefined
    ) {
        where.prepTimeInMinutes = {
            ...(normalized.minPrepTimeInMinutes !== undefined && { gte: normalized.minPrepTimeInMinutes }),
            ...(normalized.maxPrepTimeInMinutes !== undefined && { lte: normalized.maxPrepTimeInMinutes })
        };
    }

    if (
        normalized.minCookingTimeInMinutes !== undefined ||
        normalized.maxCookingTimeInMinutes !== undefined
    ) {
        where.cookingTimeInMinutes = {
            ...(normalized.minCookingTimeInMinutes !== undefined && { gte: normalized.minCookingTimeInMinutes }),
            ...(normalized.maxCookingTimeInMinutes !== undefined && { lte: normalized.maxCookingTimeInMinutes })
        };
    }

    if (normalized.minServings !== undefined || normalized.maxServings !== undefined) {
        where.servings = {
            ...(normalized.minServings !== undefined && { gte: normalized.minServings }),
            ...(normalized.maxServings !== undefined && { lte: normalized.maxServings })
        };
    }

    if (normalized.minRating !== undefined || normalized.maxRating !== undefined) {
        where.ratingOutOf5 = {
            ...(normalized.minRating !== undefined && { gte: normalized.minRating }),
            ...(normalized.maxRating !== undefined && { lte: normalized.maxRating })
        };
    }

    if (normalized.dietaryPreferences?.length) {
        where.dietaryRestrictions = {
            hasSome: normalized.dietaryPreferences
        };
    }

    if (normalized.excludeAllergens?.length) {
        where.NOT = {
            allergenNotices: {
                hasSome: normalized.excludeAllergens
            }
        };
    }

    return prisma.recipe.findMany({
        where,
        select: recipeSelect,
        orderBy: { title: 'asc' }
    });
};

export const getRecipeById = async (userId, recipeId) => {
    return prisma.recipe.findFirst({
        where: { id: recipeId, userId, status: 'PUBLISHED' },
        select: recipeSelect
    });
};

export const getRecipeByIdForUser = async (userId, recipeId) => {
    return prisma.recipe.findFirst({
        where: { id: recipeId, userId },
        select: recipeSelect
    });
};

export const updateRecipe = async (userId, recipeId, refinementInput) => {
    const existing = await prisma.recipe.findFirst({ where: { id: recipeId, userId } });
    if (!existing) return null;

    const { data } = await axios.post(process.env.N8N_WEBHOOK_URL_REFINEMENT, refinementInput);
    const recipes = parseRecipes(data);

    if (!recipes?.length) throw new Error('Unexpected n8n response: refined recipe not found');

    const r = recipes[0];
    const nutrition = r.nutritionInfo ?? existing.nutritionInfo;

    return prisma.recipe.update({
        where: { id: recipeId },
        data: {
            title: r.title ?? existing.title,
            instructions: r.instructions ?? existing.instructions,
            ingredients: r.ingredients ?? existing.ingredients,
            allergenNotices: r.allergenNotices ?? existing.allergenNotices,
            prepTimeInMinutes: Number(r.prepTimeInMinutes) || existing.prepTimeInMinutes,
            cookingTimeInMinutes: Number(r.cookingTimeInMinutes) || existing.cookingTimeInMinutes,
            servings: Number(r.servings) || existing.servings,
            dietaryRestrictions: r.dietaryRestrictions ?? existing.dietaryRestrictions,
            difficulty: r.difficulty ?? existing.difficulty,
            ratingOutOf5: Number(r.ratingOutOf5) || existing.ratingOutOf5,
            ...(nutrition && {
                nutritionInfo: {
                    upsert: {
                        update: {
                            caloriesKcal: Number(nutrition.caloriesKcal) || 0,
                            proteinG: Number(nutrition.proteinG) || 0,
                            carbsG: Number(nutrition.carbsG) || 0,
                            fatG: Number(nutrition.fatG) || 0
                        },
                        create: {
                            caloriesKcal: Number(nutrition.caloriesKcal) || 0,
                            proteinG: Number(nutrition.proteinG) || 0,
                            carbsG: Number(nutrition.carbsG) || 0,
                            fatG: Number(nutrition.fatG) || 0
                        }
                    }
                }
            })
        },
        select: recipeSelect
    });
};

export const deleteRecipe = async (userId, recipeId) => {
    return prisma.recipe.deleteMany({
        where: { id: recipeId, userId, status: 'PUBLISHED' }
    });
};

export const saveGeneratedRecipeDraft = async (userId, recipeId) => {
    const result = await prisma.recipe.updateMany({
        where: { id: recipeId, userId, status: 'DRAFT' },
        data: { status: 'PUBLISHED' }
    });

    if (result.count === 0) return null;

    return prisma.recipe.findFirst({
        where: { id: recipeId, userId, status: 'PUBLISHED' },
        select: recipeSelect
    });
};