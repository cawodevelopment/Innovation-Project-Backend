import HttpError from '../errors/http.error.js';
import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    let token;
    const authHeaders = req.headers.authorization;

    if (authHeaders && authHeaders.startsWith('Bearer ')) {
        token = authHeaders.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw new HttpError(401, 'Unauthorized');
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.id || decoded.userId;
        if (!req.userId) {
            throw new HttpError(401, 'Unauthorized');
        }
        next();
    } catch {
        throw new HttpError(401, 'Unauthorized');
    }
}

export default authenticate;