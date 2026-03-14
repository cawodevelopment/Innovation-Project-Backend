import * as userService from '../services/user.service.js';

export const getMe = async (req, res) => {
    const user = await userService.getMe(req.userId);
    res.status(200).json({
        status: "success",
        data: user
    });
}

export const updateMe = async (req, res) => {
    const user = await userService.updateMe(req.userId, req.body);
    res.status(200).json({
        status: "success",
        data: user
    });
}

export const deleteMe = async (req, res) => {
    await userService.deleteMe(req.body?.password, req.userId);
    res.status(204).json();
}

export const getUserDietaryPreferences = async (req, res) => {
    const preferences = await userService.getUserDietaryPreferences(req.userId);
    res.status(200).json({
        success: true,
        data: preferences
    });
}

export const addUserDietaryPreference = async (req, res) => {
    const preference = await userService.addUserDietaryPreference(req.userId, req.body.name);
    res.status(201).json({
        success: true,
        data: {
            name: preference
        }
    });
}

export const removeUserDietaryPreference = async (req, res) => {
    await userService.removeUserDietaryPreference(req.userId, req.body.name);
    res.status(204).json();
}

export const getUserAllergens = async (req, res) => {
    const allergens = await userService.getUserAllergens(req.userId);
    res.status(200).json({
        success: true,
        data: allergens
    });
}

export const addUserAllergen = async (req, res) => {
    const allergen = await userService.addUserAllergen(req.userId, req.body.name);
    res.status(201).json({
        success: true,
        data: {
            name: allergen
        }
    });
}

export const removeUserAllergen = async (req, res) => {
    await userService.removeUserAllergen(req.userId, req.body.name);
    res.status(204).json();
}