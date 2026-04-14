import { Router } from "express";
import { body, param } from "express-validator";

import {
  createShop,
  deleteShopByAdmin,
  getAllShops,
  getShopById,
  updateShopByAdmin,
} from "../controllers/shopController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validationMiddleware.js";

const router = Router();

router.get("/", getAllShops);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid shop id"), validateRequest],
  getShopById
);

router.post(
  "/",
  [
    protect,
    body("name").trim().notEmpty().withMessage("Shop name is required"),
    validateRequest,
  ],
  createShop
);

router.delete(
  "/:id",
  [protect, param("id").isMongoId().withMessage("Invalid shop id"), validateRequest],
  deleteShopByAdmin
);

router.put(
  "/:id",
  [
    protect,
    param("id").isMongoId().withMessage("Invalid shop id"),
    body("name").optional().trim().notEmpty().withMessage("Shop name cannot be empty"),
    validateRequest,
  ],
  updateShopByAdmin
);

export default router;
