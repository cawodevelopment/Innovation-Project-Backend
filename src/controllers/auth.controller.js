import * as authService from '../services/auth.service.js';

export const stripNonNumbers = (expiration) => {
  if (typeof expiration !== 'string') return '';

  return expiration
    .split('')
    .filter(char => char >= '0' && char <= '9')
    .join('');
}

const getRefreshTokenFromRequest = (req) => {
    const bodyToken = req.body?.refreshToken;
    if (typeof bodyToken === 'string' && bodyToken.trim().length > 0) {
        return bodyToken.trim();
    }

    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.slice(7).trim();
        if (bearerToken.length > 0) {
            return bearerToken;
        }
    }

    const cookieToken = req.cookies?.refreshToken;
    if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
        return cookieToken.trim();
    }

    return null;
};

export const registerUser = async (req, res) => {
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser
    });
}

export const loginUser = async (req, res) => {
    const { accessToken, refreshToken } = await authService.loginUser(req.body);

    const cookieOptions = {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: stripNonNumbers(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000 
    });

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: stripNonNumbers(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000 
    });

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            accessToken,
            refreshToken
        }
    });
}

export const refreshToken = async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const { accessToken, newRefreshToken } = await authService.refreshToken(refreshToken);

    res.cookie(
        'refreshToken',
        newRefreshToken,
        {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: stripNonNumbers(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000
        }
    );

    res.cookie(
        'accessToken',
        accessToken,
        {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: stripNonNumbers(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000
        }
    );

    res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
            accessToken,
            refreshToken: newRefreshToken
        }
    });
}

export const logoutUser = async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    await authService.logoutUser(refreshToken);

    const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);

    res.status(204).json();
}