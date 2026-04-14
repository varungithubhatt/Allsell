import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const requestedRole = role === "admin" ? "admin" : "user";

  if (requestedRole === "admin") {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return next(new AppError("Admin account already exists", 400));
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: requestedRole,
  });

  const token = user.generateAuthToken();

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    data: {
      user: sanitizeUser(user),
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (role && role !== user.role) {
    return next(new AppError(`This account is not registered as ${role}`, 401));
  }

  const token = user.generateAuthToken();

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: sanitizeUser(user),
    },
  });
});

export const getAdminStatus = catchAsync(async (_req, res) => {
  const adminExists = Boolean(await User.findOne({ role: "admin" }).select("_id"));

  return res.status(200).json({
    success: true,
    data: {
      adminExists,
    },
  });
});
