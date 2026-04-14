import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than or equal to 0"],
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.length <= 3,
        message: "At most 3 images are allowed",
      },
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
