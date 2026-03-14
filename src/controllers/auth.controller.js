import * as authService from '../services/auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const buildCookieOptions = (maxAge, sameSite = 'lax') => ({
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge
});

export const stripNonNumbers = (expiration) => {
  if (typeof expiration !== 'string') return '';

  return expiration
    .split('')
    .filter(char => char >= '0' && char <= '9')
    .join('');
}

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

    res.cookie(
        'refreshToken',
        refreshToken,
        buildCookieOptions(stripNonNumbers(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000)
    );

    res.cookie(
        'accessToken',
        accessToken,
        buildCookieOptions(stripNonNumbers(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000)
    );

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
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const { accessToken, newRefreshToken } = await authService.refreshToken(refreshToken);

    res.cookie(
        'refreshToken',
        newRefreshToken,
        buildCookieOptions(stripNonNumbers(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000)
    );

    res.cookie(
        'accessToken',
        accessToken,
        buildCookieOptions(stripNonNumbers(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000)
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
    const refreshToken = req.cookies?.refreshToken;

    await authService.logoutUser(refreshToken);

    res.clearCookie('refreshToken', buildCookieOptions(0));
    res.clearCookie('accessToken', buildCookieOptions(0));

    res.status(204).json();
}