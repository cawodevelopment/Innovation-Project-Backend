import * as recipeService from '../services/recipe.service.js';

export const generateRecipeDrafts = async (req, res) => {
    const drafts = await recipeService.generateRecipeDrafts(req.userId, req.body);
    res.status(200).json({
        success: true,
        data: drafts
    });
}

export const getAllRecipes = async (req, res) => {
    const recipes = await recipeService.getAllRecipes(req.userId);
    res.status(200).json({
        success: true,
        data: recipes
    });
}

export const getRecipeById = async (req, res) => {
    const recipe = await recipeService.getRecipeById(req.userId, req.params.id);
    res.status(200).json({
        success: true,
        data: recipe
    });
}

export const updateRecipe = async (req, res) => {
    const recipe = await recipeService.updateRecipe(req.userId, req.params.id, req.body);
    res.status(200).json({
        success: true,
        data: recipe
    });
}

export const deleteRecipe = async (req, res) => {
    await recipeService.deleteRecipe(req.userId, req.params.id);
    res.status(204).send();
}

export const saveGeneratedRecipeDraft = async (req, res) => {
    const recipe = await recipeService.saveGeneratedRecipeDraft(req.userId, req.params.id);
    res.status(200).json({
        success: true,
        data: recipe
    });
}

