const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    minTotal: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
