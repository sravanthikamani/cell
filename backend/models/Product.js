const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    seoDescription: String,
    longDescription: String,
    price: Number,
    brand: String,
    group: String,      // device | category
    type: String,       // smartphones | audio | chargers
    display: String,
    processor: String,
    images: [String],
    ram: String,
    storage: String,
    camera: String,
    battery: String,
    os: String,
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    colorImageMap: {
      type: Map,
      of: String,
      default: {},
    },
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
productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
