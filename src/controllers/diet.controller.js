import * as dietService from '../services/diet.service.js';

export const getAllDietaryPreferences = async (req, res) => {
    const preferences = await dietService.getAllDietaryPreferences(req.userId);
    res.status(200).json({
        success: true,
        data: preferences
    });
};

export const getAllAllergens = async (req, res) => {
    const allergens = await dietService.getAllAllergens(req.userId);
    res.status(200).json({
        success: true,
        data: allergens
    });
};
