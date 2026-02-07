const express = require("express");
const Coupon = require("../models/Coupon");

const router = express.Router();

/* VALIDATE COUPON (PUBLIC) */
router.post("/validate", async (req, res) => {
  try {
    const { code, total } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    });
    if (!coupon) return res.status(400).json({ error: "Invalid coupon" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: "Coupon expired" });
    }

    const subtotal = Number(total) || 0;
    if (subtotal < (coupon.minTotal || 0)) {
      return res
        .status(400)
        .json({ error: "Minimum order not met" });
    }

    let discount =
      coupon.type === "percent"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    if (coupon.maxDiscount && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, subtotal);

    res.json({
      code: coupon.code,
      discount,
      subtotal,
      total: subtotal - discount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
