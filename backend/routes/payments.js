const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* CREATE PAYMENT INTENT */
router.post(
  "/create-intent",
  auth,
  [body("userId").isString().notEmpty(), body("couponCode").optional().isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid request" });
    }
  try {
    const { userId, couponCode } = req.body;
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    let subtotal = 0;
    cart.items.forEach((i) => {
      subtotal += i.productId.price * i.qty;
    });

    let discount = 0;
    let appliedCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true,
      });
      if (!coupon) {
        return res.status(400).json({ error: "Invalid coupon" });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ error: "Coupon expired" });
      }
      if (subtotal < (coupon.minTotal || 0)) {
        return res.status(400).json({ error: "Minimum order not met" });
      }
      discount =
        coupon.type === "percent"
          ? (subtotal * coupon.value) / 100
          : coupon.value;
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      discount = Math.min(discount, subtotal);
      appliedCode = coupon.code;
    }

    const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT || 0);
    const TAX_RATE = Number(process.env.TAX_RATE || 0);

    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round((taxable * TAX_RATE) / 100);
    const shipping = Math.round(SHIPPING_FLAT);
    const total = taxable + tax + shipping;
    const amount = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in paise (₹100 = 10000)
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      subtotal,
      discount,
      total,
      tax,
      shipping,
      couponCode: appliedCode,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
