const mongoose = require("mongoose");

const notificationSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSubscriberSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("NotificationSubscriber", notificationSubscriberSchema);
