import { Router } from "express";

import {
  getAllProductsAdmin,
  getAllShopsAdmin,
  getAllUsers,
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, adminOnly);
router.get("/users", getAllUsers);
router.get("/shops", getAllShopsAdmin);
router.get("/products", getAllProductsAdmin);

export default router;
