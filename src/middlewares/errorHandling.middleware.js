import HttpError from "../errors/http.error.js";

const errorHandling = async (err, req, res, next) => {
  const isHttpError = err instanceof HttpError;
  const statusCode = isHttpError ? err.statusCode : 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    // Keep internal details in server logs only.
    console.error('[Unhandled Server Error]', {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });
  }

  const publicMessage = isServerError
    ? 'Something went wrong. Please try again later.'
    : (isHttpError ? err.message : 'Bad request');

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: publicMessage
    }
  });
}

export default errorHandling;