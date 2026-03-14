import prisma from '../utils/client.js';
import axios from 'axios';

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
    category: true,
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

const parseRecipes = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.recipes) return data.recipes;
    if (data?.output) return parseRecipes(data.output);
    if (data?.title || data?.ingredients) return [data];
    return null;
};

export const generateRecipeDrafts = async (userId, inputData) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL_GENERATION;
    if (!webhookUrl) throw new Error('N8N_WEBHOOK_URL_GENERATION is not configured');

    const { data } = await axios.post(webhookUrl, inputData);
    const recipes = parseRecipes(data);

    if (!recipes) throw new Error('Unexpected n8n response: recipes not found');

    const drafts = recipes.map((r) => ({
        userId,
        title: r.title ?? 'Untitled Recipe',
        status: 'DRAFT',
        instructions: r.instructions ?? [],
        ingredients: r.ingredients ?? [],
        allergenNotices: r.allergenNotices ?? [],
        prepTimeInMinutes: Number(r.prepTimeInMinutes) || 0,
        cookingTimeInMinutes: Number(r.cookingTimeInMinutes) || 0,
        servings: Number(r.servings) || 1,
        category: Number(r.category) || 0,
        dietaryRestrictions: r.dietaryRestrictions ?? [],
        difficulty: r.difficulty ?? 'unknown',
        ratingOutOf5: Number(r.ratingOutOf5) || 0,
        nutritionInfo: {
            create: {
                caloriesKcal: Number(r.nutritionInfo?.caloriesKcal) || 0,
                proteinG: Number(r.nutritionInfo?.proteinG) || 0,
                carbsG: Number(r.nutritionInfo?.carbsG) || 0,
                fatG: Number(r.nutritionInfo?.fatG) || 0
            }
        }
    }));

    const [, ...created] = await prisma.$transaction([
        prisma.recipe.deleteMany({ where: { userId, status: 'DRAFT' } }),
        ...drafts.map((draft) => prisma.recipe.create({ data: draft, select: recipeSelect }))
    ]);

    return created;
};

export const getAllRecipes = async (userId) => {
    return prisma.recipe.findMany({
        where: { userId, status: 'PUBLISHED' },
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

    const webhookUrl = process.env.N8N_WEBHOOK_URL_REFINEMENT;
    if (!webhookUrl) throw new Error('N8N_WEBHOOK_URL_REFINEMENT is not configured');

    const { data } = await axios.post(webhookUrl, refinementInput);
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
            category: Number(r.category) || existing.category,
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