import * as recipeRepository from '../repositories/recipe.repository.js';
import HttpError from '../errors/http.error.js';

export const generateRecipeDrafts = async (userId, inputData) => {
	const { dietaryPreferences, allergens } = await recipeRepository.getUserDietaryData(userId);

	const enrichedInputData = {
		...inputData,
		dietaryPreferences,
		allergens
	};

	const drafts = await recipeRepository.generateRecipeDrafts(userId, enrichedInputData);

	if (!drafts) {
		throw new HttpError(500, 'Failed to generate recipe drafts');
	}

	return drafts;
};

export const getAllRecipes = async (userId, filters) => {
	return recipeRepository.getAllRecipes(userId, filters ?? {});
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

	const { dietaryPreferences, allergens } = await recipeRepository.getUserDietaryData(userId);

    const refinementInput = {
        prompt: recipeData.prompt,
        oldRecipe,
		dietaryPreferences,
		allergens
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