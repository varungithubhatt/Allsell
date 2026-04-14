import { Router } from "express";
import { body, param, query } from "express-validator";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateRequest from "../middleware/validationMiddleware.js";

const router = Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    validateRequest,
  ],
  getAllProducts
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product id"), validateRequest],
  getProductById
);

router.post(
  "/",
  [
    protect,
    upload.array("images", 3),
    body("title").trim().notEmpty().withMessage("Product title is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    validateRequest,
  ],
  createProduct
);

router.put(
  "/:id",
  [
    protect,
    upload.array("images", 3),
    param("id").isMongoId().withMessage("Invalid product id"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    validateRequest,
  ],
  updateProduct
);

router.delete(
  "/:id",
  [protect, param("id").isMongoId().withMessage("Invalid product id"), validateRequest],
  deleteProduct
);

export default router;
