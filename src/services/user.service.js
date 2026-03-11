import HttpError from '../errors/http.error.js';
import * as userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';

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
    // Get user by ID
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    return {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences,
        allergens: user.allergens
    }
}


export const updateMe = async (userId, updateData) => {
    // Update user by ID
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);

    return {
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        dietaryPreferences: updatedUser.dietaryPreferences,
        allergens: updatedUser.allergens
    }
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