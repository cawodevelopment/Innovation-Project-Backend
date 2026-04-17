import * as authRepository from '../repositories/auth.repository.js';
import HttpError from '../errors/http.error.js';
import jwt from 'jsonwebtoken';
import * as tokens from '../utils/tokens.js';
import bcrypt from 'bcrypt';

export const registerUser = async (registerData) => {
    const { firstname, lastname, email, password } = registerData;

    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new HttpError(400, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authRepository.registerUser(firstname, lastname, email, passwordHash);

    if (!user) {
        throw new HttpError(400, 'User registration failed');
    }

    return {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
    };
}

export const loginUser = async (loginData) => {
    const { email, password } = loginData;

    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new HttpError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new HttpError(401, 'Invalid email or password');
    }

    const accessToken = tokens.generateAccessToken(user);
    const refreshToken = tokens.generateRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await authRepository.saveRefreshToken(user.id, hashedRefreshToken);

    return {
        accessToken,
        refreshToken
    };
}

export const refreshToken = async (refreshToken) => {
    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new HttpError(401, 'Invalid refresh token');
    }

    if (!payload?.id) {
        throw new HttpError(401, 'Invalid refresh token payload');
    }

    const storedTokens = await authRepository.getRefreshTokens(payload.id);

    if (storedTokens.length === 0) {
        throw new HttpError(401, 'Refresh token not found');
    }


    let matchedToken = null;
    for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, stored.token);
        if (isMatch) {
            matchedToken = stored;
            break;
        }
    }

    if (!matchedToken || matchedToken.expiresAt < new Date()) {
        throw new HttpError(401, 'Refresh token expired or invalid');
    }

    const deleted = await authRepository.deleteRefreshToken(matchedToken.id);
    if (!deleted?.count) {
        throw new HttpError(401, 'Refresh token already rotated or invalid');
    }

    const user = await authRepository.findUserById(payload.id);

    if (!user) {
        throw new HttpError(401, 'User not found');
    }

    const accessToken = tokens.generateAccessToken(user);
    const newRefreshToken = tokens.generateRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await authRepository.saveRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, newRefreshToken };
}

export const logoutUser = async (refreshToken) => {
    if (!refreshToken) {
        throw new HttpError(400, 'No refresh token provided');
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new HttpError(401, 'Invalid refresh token');
    }

    if (!payload?.id) {
        throw new HttpError(401, 'Invalid refresh token payload');
    }

    const storedTokens = await authRepository.getRefreshTokens(payload.id);
    
    for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, stored.token);
        if (isMatch) {
            await authRepository.deleteRefreshToken(stored.id);
            return;
        }
    }

    throw new HttpError(401, 'Refresh token not found');
}