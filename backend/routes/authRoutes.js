import { Router } from "express";
import { body } from "express-validator";

import { getAdminStatus, login, register } from "../controllers/authController.js";
import validateRequest from "../middleware/validationMiddleware.js";

const router = Router();

router.get("/admin-status", getAdminStatus);

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin"),
    validateRequest,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin"),
    validateRequest,
  ],
  login
);

export default router;
