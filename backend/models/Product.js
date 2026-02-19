const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    brand: String,
    group: String,      // device | category
    type: String,       // smartphones | audio | chargers
    images: [String],
    ram: String,
    storage: String,
    sizes: [String],
    colors: [String],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

productSchema.index({ group: 1, type: 1, brand: 1, status: 1 });
productSchema.index({ name: "text", brand: "text" });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
