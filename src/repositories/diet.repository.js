import prisma from '../utils/client.js';

export const getAllDietaryPreferences = async () => {
    return prisma.dietaryPreference.findMany({
        select: {
            id: true,
            name: true
        }
    });
}

export const getAllAllergens = async () => {
    return prisma.allergen.findMany({
        select: {
            id: true,
            name: true,
        }
    });
}