import recipeService from '../services/recipe.service.js';

export const generateRecipeDrafts = async (req, res) => {
    // Generate recipe drafts based on user input
}

export const refineRecipeDraft = async (req, res) => {
    // Refine a specific recipe draft based on user feedback
}

export const getAllRecipes = async (req, res) => {
    const recipes = await recipeService.getAllRecipes(req.userId);
    res.status(200).json({
        success: true,
        data: recipes
    });
}

export const getRecipeById = async (req, res) => {
    const recipe = await recipeService.getRecipeById(req.params.id, req.userId);
    res.status(200).json({
        success: true,
        data: recipe
    });
}

export const saveGeneratedRecipe = async (req, res) => {
    const recipe = await recipeService.saveGeneratedRecipe(req.body, req.userId);
    res.status(201).json({
        success: true,
        data: recipe
    });
}

export const saveRefinedRecipe = async (req, res) => {
    const recipe = await recipeService.saveRefinedRecipe(req.params.id, req.body, req.userId);
    res.status(200).json({
        success: true,
        data: recipe
    });
}

export const deleteRecipe = async (req, res) => {
    await recipeService.deleteRecipe(req.params.id, req.userId);
    res.status(204).json({
        success: true,
        data: {}
    });
}