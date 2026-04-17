import prisma from '../utils/client.js';

const buildRefreshTokenExpiryDate = (expiresIn) => {
    const now = Date.now();

    if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
        return new Date(now + (expiresIn * 1000));
    }

    if (typeof expiresIn !== 'string') {
        return new Date(now + (7 * 24 * 60 * 60 * 1000));
    }

    const trimmed = expiresIn.trim();
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) {
        return new Date(now + (asNumber * 1000));
    }

    const match = trimmed.match(/^(\d+)\s*([smhd])$/i);
    if (!match) {
        return new Date(now + (7 * 24 * 60 * 60 * 1000));
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return new Date(now + (value * multipliers[unit]));
};

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
    const expiresAt = buildRefreshTokenExpiryDate(process.env.REFRESH_TOKEN_EXPIRES_IN);
    
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
    return await prisma.refreshToken.deleteMany({
        where: { id: tokenId }
    });
}