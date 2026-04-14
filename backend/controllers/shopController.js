import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createShop = catchAsync(async (req, res, next) => {
  const existingShop = await Shop.findOne({ owner: req.user._id });

  if (existingShop) {
    return next(new AppError("You can only create one shop", 400));
  }

  const shop = await Shop.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Shop created successfully",
    data: { shop },
  });
});

export const getAllShops = catchAsync(async (_req, res) => {
  const shops = await Shop.find().populate("owner", "name email role").sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: shops.length,
    data: { shops },
  });
});

export const getShopById = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id).populate("owner", "name email role");

  if (!shop) {
    return next(new AppError("Shop not found", 404));
  }

  const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      shop,
      products,
    },
  });
});

export const deleteShopByAdmin = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new AppError("Shop not found", 404));
  }

  const isOwner = shop.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Forbidden: only shop owner or admin can delete shop", 403));
  }

  await Product.deleteMany({ shop: shop._id });
  await shop.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Shop deleted successfully",
  });
});

export const updateShopByAdmin = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new AppError("Shop not found", 404));
  }

  const isOwner = shop.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Forbidden: only shop owner or admin can update shop", 403));
  }

  const allowedUpdates = {
    name: req.body.name,
    description: req.body.description,
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] !== undefined) {
      shop[key] = allowedUpdates[key];
    }
  });

  await shop.save();

  return res.status(200).json({
    success: true,
    message: "Shop updated successfully",
    data: { shop },
  });
});
