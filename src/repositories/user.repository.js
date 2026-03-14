import prisma from '../utils/client.js';

const userProfileInclude = {
    userDietaryPreferences: {
        select: {
            dietaryPreference: {
                select: {
                    name: true
                }
            }
        }
    },
    userAllergens: {
        select: {
            allergen: {
                select: {
                    name: true
                }
            }
        }
    }
};

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
        include: userProfileInclude
    });
}

export const updateUser = async (userId, updateData) => {
    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: userProfileInclude
    });
}

export const deleteUser = async (userId) => {
    return await prisma.user.delete({
        where: { id: userId }
    });
}

export const getUserDietaryPreferences = async (userId) => {
    return await prisma.userDietaryPreference.findMany({
        where: { userId },
        select: {
            dietaryPreference: {
                select: { name: true }
            }
        }
    });
}

export const getUserAllergens = async (userId) => {
    return await prisma.userAllergen.findMany({
        where: { userId },
        select: {
            allergen: {
                select: { name: true }
            }
        }
    });
}

export const addUserDietaryPreference = async (userId, preferenceName) => {
    const preference = await prisma.dietaryPreference.findFirst({
        where: { name: { equals: preferenceName.trim(), mode: 'insensitive' } }
    });

    if (!preference) {
        return null;
    }

    const existingLink = await prisma.userDietaryPreference.findFirst({
        where: {
            userId,
            dietaryPreferenceId: preference.id
        },
        include: {
            dietaryPreference: true
        }
    });

    if (existingLink) {
        return existingLink;
    }

    return await prisma.userDietaryPreference.create({
        data: {
            userId,
            dietaryPreferenceId: preference.id
        },
        include: {
            dietaryPreference: true
        }
    });
}

export const addUserAllergen = async (userId, allergenName) => {
    const allergen = await prisma.allergen.findFirst({
        where: { name: { equals: allergenName.trim(), mode: 'insensitive' } }
    });

    if (!allergen) {
        return null;
    }

    const existingLink = await prisma.userAllergen.findFirst({
        where: {
            userId,
            allergenId: allergen.id
        },
        include: {
            allergen: true
        }
    });

    if (existingLink) {
        return existingLink;
    }

    return await prisma.userAllergen.create({
        data: {
            userId,
            allergenId: allergen.id
        },
        include: {
            allergen: true
        }
    });
}

export const removeUserDietaryPreference = async (userId, preferenceName) => {
    const preference = await prisma.dietaryPreference.findFirst({
        where: { name: { equals: preferenceName.trim(), mode: 'insensitive' } }
    });

    if (!preference) {
        return { count: 0 };
    }

    return await prisma.userDietaryPreference.deleteMany({
        where: {
            userId,
            dietaryPreferenceId: preference.id
        }
    });
}

export const removeUserAllergen = async (userId, allergenName) => {
    const allergen = await prisma.allergen.findFirst({
        where: { name: { equals: allergenName.trim(), mode: 'insensitive' } }
    });

    if (!allergen) {
        return { count: 0 };
    }

    return await prisma.userAllergen.deleteMany({
        where: {
            userId,
            allergenId: allergen.id
        }
    });
}