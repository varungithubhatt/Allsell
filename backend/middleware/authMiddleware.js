import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const protect = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return next(new AppError("Unauthorized: token missing", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("Unauthorized: user not found", 401));
  }

  req.user = user;
  next();
});

export const adminOnly = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Forbidden: admin access only", 403));
  }

  next();
};
