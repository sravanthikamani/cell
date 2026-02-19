const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    addresses: [
      {
        name: String,
        phone: String,
        street: String,
        city: String,
        pincode: String,
      },
    ],
    resetTokenHash: String,
    resetTokenExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: String,
    emailVerificationExpires: Date,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ isBlocked: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
