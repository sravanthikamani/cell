const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Exclusive Special Offer",
      trim: true,
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    discountValue: {
      type: Number,
      default: 10,
      min: 0,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

offerSchema.index({ isEnabled: 1, startsAt: 1, endsAt: 1 });
offerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Offer", offerSchema);
