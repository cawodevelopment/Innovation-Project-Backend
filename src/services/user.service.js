import HttpError from '../errors/http.error.js';
import * as userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';

const mapUserProfileResponse = (user) => ({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    dietaryPreferences: user.userDietaryPreferences?.map((item) => item.dietaryPreference.name) ?? [],
    allergens: user.userAllergens?.map((item) => item.allergen.name) ?? []
});

export const checkUnique = async (email) => {
    // Check if email is unique
    const user = await userRepository.findUserByEmail(email);

    if (user) {
        throw new HttpError(409, "User already exists");
    }
}

export const getUserByEmail = async (email) => {
    // Check if email is unique
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    return user;
}

export const getMe = async (userId) => {
    const user = await userRepository.findUserProfileById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    return mapUserProfileResponse(user);
}

export const getUserDietaryPreferences = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const preferences = await userRepository.getUserDietaryPreferences(userId);
    return preferences.map((item) => item.dietaryPreference.name);
}

export const getUserAllergens = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const allergens = await userRepository.getUserAllergens(userId);
    return allergens.map((item) => item.allergen.name);
}

export const addUserDietaryPreference = async (userId, preferenceName) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const created = await userRepository.addUserDietaryPreference(userId, preferenceName.trim());

    if (!created) {
        throw new HttpError(404, "Dietary preference not found");
    }

    return created.dietaryPreference.name;
}

export const addUserAllergen = async (userId, allergenName) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const created = await userRepository.addUserAllergen(userId, allergenName.trim());

    if (!created) {
        throw new HttpError(404, "Allergen not found");
    }

    return created.allergen.name;
}

export const removeUserDietaryPreference = async (userId, preferenceName) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const result = await userRepository.removeUserDietaryPreference(userId, preferenceName.trim());

    if (result.count === 0) {
        throw new HttpError(404, "Dietary preference not found for user");
    }
}

export const removeUserAllergen = async (userId, allergenName) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const result = await userRepository.removeUserAllergen(userId, allergenName.trim());

    if (result.count === 0) {
        throw new HttpError(404, "Allergen not found for user");
    }
}


export const updateMe = async (userId, updateData) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    if (Object.keys(updateData).length > 0) {
        await userRepository.updateUser(userId, updateData);
    }

    const updatedUser = await userRepository.findUserProfileById(userId);

    return mapUserProfileResponse(updatedUser);
};


export const deleteMe = async (password, userId) => {
    if (!password) {
        throw new HttpError(400, "Password is required");
    }

    // Get user by ID
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new HttpError(401, "Invalid credentials");
    }

    // Delete user by ID
    await userRepository.deleteUser(userId);
}