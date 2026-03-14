import express from 'express';
import * as dietController from '../controllers/diet.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/dietary-preferences', authenticate, dietController.getAllDietaryPreferences);
    
router.get('/allergens', authenticate, dietController.getAllAllergens);

export default router;