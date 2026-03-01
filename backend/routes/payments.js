const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const { normalizePrice } = require("../utils/price");
const {
  computeOrderTotals,
  normalizeShippingOption,
} = require("../utils/checkoutPricing");
const {
  isPayPalConfigured,
  getPayPalCurrency,
  createPayPalOrder,
} = require("../utils/paypal");

let stripe = null;
try {
  stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
} catch (err) {
  console.warn("Stripe initialization failed:", err.message);
  stripe = null;
}

function isStripeConfigured() {
  const key = String(process.env.STRIPE_SECRET_KEY || "").trim();
  return key.startsWith("sk_");
}

async function loadPricingForCheckout({
  userId,
  couponCode,
  shippingOption = "standard",
}) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    const err = new Error("Cart empty");
    err.status = 400;
    throw err;
  }

  let subtotal = 0;
  cart.items.forEach((i) => {
    subtotal += normalizePrice(i.productId.price) * i.qty;
  });

  let discount = 0;
  let appliedCode = "";
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      active: true,
    });
    if (!coupon) {
      const err = new Error("Invalid coupon");
      err.status = 400;
      throw err;
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      const err = new Error("Coupon expired");
      err.status = 400;
      throw err;
    }
    if (subtotal < (coupon.minTotal || 0)) {
      const err = new Error("Minimum order not met");
      err.status = 400;
      throw err;
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

  const totals = computeOrderTotals({
    subtotal,
    discount,
    shippingOption: normalizeShippingOption(shippingOption),
  });
  const { tax, shipping, total, shippingOption: appliedShippingOption } = totals;
  if (total <= 0) {
    const err = new Error("Invalid order total");
    err.status = 400;
    throw err;
  }

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    shippingOption: appliedShippingOption,
    couponCode: appliedCode,
  };
}

/* CREATE PAYMENT INTENT */
router.post(
  "/create-intent",
  auth,
  [
    body("userId").isString().notEmpty(),
    body("couponCode").optional().isString(),
    body("paymentMethod").optional().isString(),
    body("shippingOption").optional().isIn(["standard", "express", "pickup"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid request" });
    }
    try {
      const {
        userId,
        couponCode,
        paymentMethod = "stripe",
        shippingOption = "standard",
      } = req.body;
      if (String(req.user.id) !== String(userId)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pricing = await loadPricingForCheckout({
        userId,
        couponCode,
        shippingOption,
      });

      if (paymentMethod === "paypal") {
        return res.json({
          clientSecret: null,
          ...pricing,
        });
      }
      if (!isStripeConfigured()) {
        return res.status(500).json({
          error:
            "Stripe is not configured. Set backend STRIPE_SECRET_KEY to a valid sk_test/sk_live key.",
        });
      }

      const amount = Math.round(pricing.total * 100);

      const baseCurrency = String(
        process.env.STRIPE_CURRENCY || "eur"
      ).toLowerCase();
      let intentParams = {
        amount,
        currency: baseCurrency,
      };

      if (paymentMethod === "klarna") {
        intentParams = {
          ...intentParams,
          currency: "eur",
          payment_method_types: ["klarna"],
        };
      } else {
        intentParams = {
          ...intentParams,
          automatic_payment_methods: { enabled: true },
        };
      }

      const paymentIntent = await stripe.paymentIntents.create(intentParams);

      res.json({
        clientSecret: paymentIntent.client_secret,
        ...pricing,
      });
    } catch (err) {
      console.error("create-intent failed:", err.message);
      res.status(err.status || 500).json({ error: err.message });
    }
  }
);

router.post(
  "/paypal/create-order",
  auth,
  [
    body("userId").isString().notEmpty(),
    body("couponCode").optional().isString(),
    body("shippingOption").optional().isIn(["standard", "express", "pickup"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid request" });
    }
    try {
      if (!isPayPalConfigured()) {
        return res.status(500).json({
          error:
            "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
        });
      }
      const { userId, couponCode, shippingOption = "standard" } = req.body;
      if (String(req.user.id) !== String(userId)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pricing = await loadPricingForCheckout({
        userId,
        couponCode,
        shippingOption,
      });
      const currency = getPayPalCurrency();
      const order = await createPayPalOrder({
        total: pricing.total,
        currency,
      });

      res.json({
        orderId: order.id,
        currency,
        ...pricing,
      });
    } catch (err) {
      console.error("paypal create-order failed:", err.message);
      res.status(err.status || 500).json({ error: err.message });
    }
  }
);

module.exports = router;
