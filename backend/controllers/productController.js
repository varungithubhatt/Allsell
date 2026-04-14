import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { cloudinary, hasCloudinaryConfig } from "../utils/cloudinary.js";

const uploadImageToCloudinary = async (fileBuffer, mimetype) => {
  if (!hasCloudinaryConfig) {
    throw new AppError("Cloudinary is not configured on server", 500);
  }

  const base64Image = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "allsell/products",
  });
  return result.secure_url;
};

const uploadManyImagesToCloudinary = async (files = []) => {
  if (files.length === 0) {
    return [];
  }

  if (files.length > 3) {
    throw new AppError("At most 3 images are allowed", 400);
  }

  return Promise.all(
    files.map((file) => uploadImageToCloudinary(file.buffer, file.mimetype))
  );
};

const getOwnerShopOrThrow = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) {
    throw new AppError("Create a shop before managing products", 400);
  }
  return shop;
};

export const createProduct = catchAsync(async (req, res) => {
  const shop = await getOwnerShopOrThrow(req.user._id);

  const uploadedImageUrls = await uploadManyImagesToCloudinary(req.files || []);
  const imageUrls = uploadedImageUrls.length > 0 ? uploadedImageUrls : [];
  const imageUrl = imageUrls[0] || "";

  const product = await Product.create({
    title: req.body.title,
    price: req.body.price,
    imageUrl,
    imageUrls,
    shop: shop._id,
  });

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
});

export const getAllProducts = catchAsync(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate({
        path: "shop",
        populate: { path: "owner", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(),
  ]);

  return res.status(200).json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: { products },
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: "shop",
    populate: { path: "owner", select: "name email" },
  });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return res.status(200).json({
    success: true,
    data: { product },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("shop");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const isOwner = product.shop.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Forbidden: only shop owner or admin can update products", 403));
  }

  if (req.files?.length) {
    const uploadedImageUrls = await uploadManyImagesToCloudinary(req.files);
    req.body.imageUrls = uploadedImageUrls;
    req.body.imageUrl = uploadedImageUrls[0] || "";
  }

  const allowedUpdates = {
    title: req.body.title,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    imageUrls: req.body.imageUrls,
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] !== undefined) {
      product[key] = allowedUpdates[key];
    }
  });

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("shop");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const isOwner = product.shop.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Forbidden: only owner or admin can delete product", 403));
  }

  await product.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
