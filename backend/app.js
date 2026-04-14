import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { notFound } from "./middleware/errorHandlerMiddleware.js";
import errorHandler from "./middleware/errorHandlerMiddleware.js";
import sanitizeInputs from "./middleware/sanitizeMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInputs);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ALLsell backend is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
