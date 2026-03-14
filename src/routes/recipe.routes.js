import express from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import validate from '../middlewares/inputSanitisation.middleware.js';
import generateRecipeDraftsSchema from '../schemas/recipe/generateRecipeDrafts.schema.js';
import publishRecipeDraftSchema from '../schemas/recipe/publishRecipeDraft.schema.js';
import updateRecipeSchema from '../schemas/recipe/updateRecipe.schema.js';

const router = express.Router();

router.route('/')
    .post(authenticate, validate(generateRecipeDraftsSchema), recipeController.generateRecipeDrafts)
    .get(authenticate, recipeController.getAllRecipes);

router.route('/:id')
    .get(authenticate, recipeController.getRecipeById)
    .put(authenticate, validate(updateRecipeSchema), recipeController.updateRecipe)
    .delete(authenticate, recipeController.deleteRecipe);

router.put('/:id/publish', authenticate, validate(publishRecipeDraftSchema), recipeController.saveGeneratedRecipeDraft);

export default router;