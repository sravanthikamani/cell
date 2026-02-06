const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: Number,
        price: Number,
      },
    ],

    address: {
      name: String,
      phone: String,
      street: String,
      city: String,
      pincode: String,
    },

    total: Number,
status: {
  type: String,
  enum: ["pending", "paid", "shipped", "delivered"],
  default: "pending",
},
paymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
