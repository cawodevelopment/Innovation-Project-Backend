import prisma from '../utils/client.js';

export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    });
}

export const findUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}

export const findUserProfileById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            dietaryPreferences: true,
            allergens: true
        }
    });
}

export const updateUser = async (userId, updateData) => {
    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
            dietaryPreferences: true,
            allergens: true
        }
    });
}

export const deleteUser = async (userId) => {
    return await prisma.user.delete({
        where: { id: userId }
    });
}