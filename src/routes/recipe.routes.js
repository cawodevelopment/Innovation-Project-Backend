import express from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/generate', authenticate, recipeController.generateRecipeDrafts);
router.post('/refine', authenticate, recipeController.refineRecipeDraft);

router.route('/')
    .get(authenticate, recipeController.getAllRecipes)
    .post(authenticate, recipeController.saveGeneratedRecipe);

router.route('/:id')
    .get(authenticate, recipeController.getRecipeById)
    .put(authenticate, recipeController.saveRefinedRecipe)
    .delete(authenticate, recipeController.deleteRecipe);

export default router;