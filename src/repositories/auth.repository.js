import prisma from '../utils/client.js';

export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    });
}

export const registerUser = async (firstname, lastname, email, passwordHash) => {
    return await prisma.user.create({
        data: {
            firstname,
            lastname,
            email,
            passwordHash
        }
    });
}

export const saveRefreshToken = async (userId, refreshTokenHash) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days
    
    return await prisma.refreshToken.create({
        data: {
            userId,
            token: refreshTokenHash,
            expiresAt
        }
    });
}

export const findUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}

export const getRefreshTokens = async (userId) => {
    return await prisma.refreshToken.findMany({
        where: { userId }
    });
}

export const deleteRefreshToken = async (tokenId) => {
    return await prisma.refreshToken.delete({
        where: { id: tokenId }
    });
}