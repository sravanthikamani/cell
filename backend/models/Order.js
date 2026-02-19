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
        variant: {
          size: String,
          color: String,
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
    subtotal: Number,
    discount: Number,
    couponCode: String,
    shipping: {
      type: Number,
      default: 0,
    },
    shippingOption: {
      type: String,
      enum: ["standard", "express", "pickup"],
      default: "standard",
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled", "placed"],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        at: Date,
      },
    ],
    paymentId: String,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    trackingNumber: String,
    carrier: String,
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
