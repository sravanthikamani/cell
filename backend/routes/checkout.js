const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const Coupon = require("../models/Coupon");
const Stripe = require("stripe");
const { normalizePrice } = require("../utils/price");
const {
  getActiveOfferForProductIds,
  getOfferAdjustedUnitPrice,
} = require("../utils/offerPricing");
const {
  computeOrderTotals,
  normalizeShippingOption,
} = require("../utils/checkoutPricing");
const {
  isPayPalConfigured,
  getPayPalCurrency,
  capturePayPalOrder,
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

function mapStripeIntentToOrderState(status) {
  switch (status) {
    case "succeeded":
      return { orderStatus: "paid", paymentStatus: "succeeded" };
    case "processing":
      return { orderStatus: "pending", paymentStatus: "processing" };
    case "requires_action":
      return { orderStatus: "pending", paymentStatus: "requires_action" };
    case "requires_payment_method":
      return { orderStatus: "failed", paymentStatus: "failed" };
    case "canceled":
      return { orderStatus: "cancelled", paymentStatus: "cancelled" };
    default:
      return { orderStatus: "pending", paymentStatus: "pending" };
  }
}

/* PLACE ORDER */
router.post(
  "/",
  auth,
  [
    body("userId").isString().notEmpty(),
    body("paymentMethod").optional().isString(),
    body("address").optional().isObject(),
    body("couponCode").optional().isString(),
    body("shippingOption").optional().isIn(["standard", "express", "pickup"]),
    body("paymentId").optional().isString(),
    body("paypalOrderId").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid request" });
    }
  try {
    const {
      userId,
      address,
      paymentMethod,
      couponCode,
      shippingOption = "standard",
      paymentId,
      paypalOrderId,
    } = req.body;
    const normalizedPaymentMethod = String(paymentMethod || "stripe").toLowerCase();
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!address || typeof address !== "object") {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    const requiredAddressFields = ["name", "phone", "street", "city", "pincode"];
    const missingAddressField = requiredAddressFields.find(
      (field) => !String(address[field] || "").trim()
    );
    if (missingAddressField) {
      return res.status(400).json({ message: `Address ${missingAddressField} is required` });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const missingProductItems = (cart.items || []).filter((i) => !i?.productId);
    if (missingProductItems.length > 0) {
      return res.status(400).json({
        message:
          "Some items in your cart are no longer available. Please remove them and try again.",
      });
    }

    const activeOffer = await getActiveOfferForProductIds(
      (cart.items || []).map((i) => i?.productId?._id || i?.productId)
    );

    let subtotal = 0;
    for (const i of cart.items) {
      if ((i.productId.stock || 0) < i.qty) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for some items" });
      }
      const unitPrice = getOfferAdjustedUnitPrice({
        productId: i.productId._id || i.productId,
        basePrice: i.productId.price,
        activeOffer,
      });
      subtotal += unitPrice * i.qty;
    }

    let discount = 0;
    let appliedCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true,
      });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon" });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: "Coupon expired" });
      }
      if (subtotal < (coupon.minTotal || 0)) {
        return res.status(400).json({ message: "Minimum order not met" });
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
    let resolvedPaymentId = paymentId || "";
    let orderStatus = "paid";
    let paymentStatus = normalizedPaymentMethod === "paypal" ? "succeeded" : "pending";
    let paymentCurrency = "";
    let paymentAmount = 0;

    if (["stripe", "klarna"].includes(normalizedPaymentMethod)) {
      if (!resolvedPaymentId) {
        return res.status(400).json({ message: "Stripe payment intent ID is required" });
      }
      if (!isStripeConfigured() || !stripe) {
        return res.status(500).json({
          message:
            "Stripe is not configured. Set backend STRIPE_SECRET_KEY to a valid sk_test/sk_live key.",
        });
      }

      const existingOrder = await Order.findOne({ paymentId: resolvedPaymentId });
      if (existingOrder) {
        if (String(existingOrder.userId) !== String(req.user.id)) {
          return res.status(403).json({ message: "Forbidden" });
        }
        return res.json(existingOrder);
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(resolvedPaymentId);
      const expectedAmount = Math.round(total * 100);
      const paidAmount = Number(paymentIntent.amount || 0);
      const paidCurrency = String(paymentIntent.currency || "").toLowerCase();
      const expectedCurrency = String(process.env.STRIPE_CURRENCY || "eur").toLowerCase();
      const metadataUserId = String(paymentIntent?.metadata?.userId || "");

      if (metadataUserId && metadataUserId !== String(req.user.id)) {
        return res.status(400).json({ message: "Payment intent does not belong to this user" });
      }
      if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
        return res.status(400).json({ message: "Stripe paid amount mismatch" });
      }
      if (paidCurrency !== expectedCurrency) {
        return res.status(400).json({ message: "Stripe currency mismatch" });
      }

      const mappedState = mapStripeIntentToOrderState(paymentIntent.status);
      orderStatus = mappedState.orderStatus;
      paymentStatus = mappedState.paymentStatus;
      paymentCurrency = paidCurrency.toUpperCase();
      paymentAmount = Number(paymentIntent.amount_received || paymentIntent.amount || 0) / 100;
    }

    if (normalizedPaymentMethod === "paypal") {
      if (!paypalOrderId) {
        return res.status(400).json({ message: "PayPal order ID is required" });
      }
      if (!isPayPalConfigured()) {
        return res.status(500).json({
          message:
            "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
        });
      }

      const captureData = await capturePayPalOrder(paypalOrderId);
      const purchaseUnit = captureData?.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];

      if (!capture || capture.status !== "COMPLETED") {
        return res.status(400).json({ message: "PayPal capture failed" });
      }

      const paidAmount = Number(
        capture?.amount?.value || purchaseUnit?.amount?.value || 0
      );
      const paidCurrency = String(
        capture?.amount?.currency_code || purchaseUnit?.amount?.currency_code || ""
      ).toUpperCase();
      const expectedCurrency = getPayPalCurrency();
      const expectedAmount = Number(total.toFixed(2));

      if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - expectedAmount) > 0.01) {
        return res.status(400).json({ message: "PayPal paid amount mismatch" });
      }
      if (paidCurrency !== expectedCurrency) {
        return res.status(400).json({ message: "PayPal currency mismatch" });
      }

      resolvedPaymentId = capture.id || paypalOrderId;
      paymentCurrency = paidCurrency;
      paymentAmount = paidAmount;
    }

    const orderItems = cart.items.map((i) => ({
      productId: i.productId._id || i.productId,
      qty: i.qty,
      price: getOfferAdjustedUnitPrice({
        productId: i.productId._id || i.productId,
        basePrice: i.productId.price,
        activeOffer,
      }),
      variant: i.variant || {},
    }));

    const order = await Order.create({
      userId,
      items: orderItems,
      total,
      subtotal,
      discount,
      couponCode: appliedCode,
      shipping,
      shippingOption: appliedShippingOption,
      tax,
      grandTotal: total,
      address,
      paymentMethod: normalizedPaymentMethod,
      paymentId: resolvedPaymentId,
      paymentStatus,
      paymentCurrency,
      paymentAmount,
      status: orderStatus,
      statusHistory: [{ status: orderStatus, at: new Date() }],
    });

    // Decrease stock
    for (const i of cart.items) {
      await i.productId.updateOne({
        $inc: { stock: -i.qty },
      });
    }

    // 🔥 CLEAR CART AFTER ORDER
    cart.items = [];
    await cart.save();

    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendMail({
          to: user.email,
          subject: "Order confirmation",
          text: `Your order ${order._id} has been ${order.status === "paid" ? "confirmed" : "received"}. Total: EUR ${total}.`,
        });
        order.confirmationSentAt = new Date();
        await order.save();
      }
    } catch {
      // ignore email failures
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
