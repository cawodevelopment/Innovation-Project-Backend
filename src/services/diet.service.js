import * as dietRepository from '../repositories/diet.repository.js';
import HttpError from '../errors/http.error.js';

export const getAllDietaryPreferences = async (usrId) => {
    const preferences = await dietRepository.getAllDietaryPreferences();
    return preferences;
}

export const getAllAllergens = async (usrId) => {
    const allergens = await dietRepository.getAllAllergens();
    return allergens;
}