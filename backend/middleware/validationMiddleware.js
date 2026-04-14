import { validationResult } from "express-validator";

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const firstError = errors.array()[0];
  return next({
    statusCode: 400,
    message: firstError.msg,
  });
};

export default validateRequest;
