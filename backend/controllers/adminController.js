import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllUsers = catchAsync(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: users.length,
    data: { users },
  });
});

export const getAllShopsAdmin = catchAsync(async (_req, res) => {
  const shops = await Shop.find().populate("owner", "name email role").sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: shops.length,
    data: { shops },
  });
});

export const getAllProductsAdmin = catchAsync(async (_req, res) => {
  const products = await Product.find()
    .populate({
      path: "shop",
      populate: { path: "owner", select: "name email role" },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: products.length,
    data: { products },
  });
});
