import * as recipeRepository from '../repositories/recipe.repository.js';
import HttpError from '../errors/http.error.js';
import prisma from '../utils/client.js';

export const generateRecipeDrafts = async (userId, inputData) => {
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

	const enrichedInputData = {
		...inputData,
		dietaryPreferences: dietaryPreferences.map((pref) => pref.dietaryPreference.name),
		allergens: allergens.map((allergen) => allergen.allergen.name)
	};

	const drafts = await recipeRepository.generateRecipeDrafts(userId, enrichedInputData);

	if (!drafts) {
		throw new HttpError(500, 'Failed to generate recipe drafts');
	}

	return drafts;
};

export const getAllRecipes = async (userId) => {
	return recipeRepository.getAllRecipes(userId);
};

export const getRecipeById = async (userId, recipeId) => {
	const recipe = await recipeRepository.getRecipeById(userId, recipeId);

	if (!recipe) {
		throw new HttpError(404, 'Recipe not found');
	}

	return recipe;
};

export const updateRecipe = async (userId, recipeId, recipeData) => {
    const oldRecipe = await recipeRepository.getRecipeByIdForUser(userId, recipeId);

    if (!oldRecipe) {
		throw new HttpError(404, 'Recipe not found');
	}

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

    const refinementInput = {
        prompt: recipeData.prompt,
        oldRecipe,
		dietaryPreferences: dietaryPreferences.map((pref) => pref.dietaryPreference.name),
		allergens: allergens.map((allergen) => allergen.allergen.name)
    };


    const newRecipe = await recipeRepository.updateRecipe(userId, recipeId, refinementInput);
	

	if (!newRecipe) {
		throw new HttpError(404, 'Recipe not found');
	}

	return newRecipe;
};

export const deleteRecipe = async (userId, recipeId) => {
	const result = await recipeRepository.deleteRecipe(userId, recipeId);

	if (result.count === 0) {
		throw new HttpError(404, 'Recipe not found');
	}

	return result;
};

export const saveGeneratedRecipeDraft = async (userId, recipeId) => {
	const recipe = await recipeRepository.saveGeneratedRecipeDraft(userId, recipeId);

	if (!recipe) {
		throw new HttpError(404, 'Recipe draft not found');
	}

	return recipe;
};