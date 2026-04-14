import AppError from "../utils/appError.js";

const handleCastError = () => new AppError("Resource not found", 404);

const handleDuplicateFields = () =>
  new AppError("Duplicate field value entered", 400);

const handleValidationError = (err) => {
  const firstMessage = Object.values(err.errors)[0]?.message || "Validation error";
  return new AppError(firstMessage, 400);
};

const handleJwtError = () => new AppError("Invalid token", 401);
const handleJwtExpiredError = () => new AppError("Token expired", 401);
const handleMulterError = (err) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return new AppError("At most 3 images are allowed", 400);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("Each image must be less than 3MB", 400);
  }

  return new AppError(err.message || "File upload error", 400);
};

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
  let error = {
    ...err,
    message: err.message,
    statusCode: err.statusCode || 500,
  };

  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateFields(err);
  }

  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  if (err.name === "JsonWebTokenError") {
    error = handleJwtError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJwtExpiredError();
  }

  if (err.name === "MulterError") {
    error = handleMulterError(err);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

export default errorHandler;
