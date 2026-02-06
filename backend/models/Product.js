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
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
