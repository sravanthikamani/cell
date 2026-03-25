const express = require("express");
const NotificationSubscriber = require("../models/NotificationSubscriber");
const {
  normalizeEmail,
  sendWelcomeNotificationEmail,
} = require("../utils/notifications");

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const existing = await NotificationSubscriber.findOne({ email });
    const isAlreadyActive = Boolean(existing?.isActive);

    const subscriber = existing || new NotificationSubscriber({ email });
    subscriber.isActive = true;
    if (!subscriber.subscribedAt) {
      subscriber.subscribedAt = new Date();
    }
    await subscriber.save();

    if (!isAlreadyActive) {
      try {
        await sendWelcomeNotificationEmail(email);
      } catch (err) {
        console.error("Notify Me welcome email failed:", err.message);
        return res.status(202).json({
          success: true,
          subscribed: true,
          emailSent: false,
          message: "Subscription saved, but the welcome email could not be sent right now.",
        });
      }
    }

    return res.json({
      success: true,
      subscribed: true,
      alreadySubscribed: isAlreadyActive,
      emailSent: !isAlreadyActive,
      message: isAlreadyActive
        ? "This email is already subscribed."
        : "Welcome email sent successfully.",
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.json({
        success: true,
        subscribed: true,
        alreadySubscribed: true,
        emailSent: false,
        message: "This email is already subscribed.",
      });
    }

    return res.status(500).json({
      error: err.message || "Failed to subscribe",
    });
  }
});

module.exports = router;
