import HttpError from '../errors/http.error.js';

const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch {
        throw new HttpError(400, 'Invalid input data');
    }
}

export default validate;