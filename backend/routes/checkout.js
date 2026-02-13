const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const Coupon = require("../models/Coupon");
const { normalizePrice } = require("../utils/price");

/* PLACE ORDER */
router.post(
  "/",
  auth,
  [
    body("userId").isString().notEmpty(),
    body("paymentMethod").optional().isString(),
    body("address").optional().isObject(),
    body("couponCode").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid request" });
    }
  try {
    const { userId, address, paymentMethod, couponCode } = req.body;
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    for (const i of cart.items) {
      if ((i.productId.stock || 0) < i.qty) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for some items" });
      }
      subtotal += normalizePrice(i.productId.price) * i.qty;
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

    const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT || 0);
    const TAX_RATE = Number(process.env.TAX_RATE || 0);

    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round((taxable * TAX_RATE) / 100);
    const shipping = Math.round(SHIPPING_FLAT);
    const total = taxable + tax + shipping;

    const orderItems = cart.items.map((i) => ({
      productId: i.productId._id || i.productId,
      qty: i.qty,
      price: normalizePrice(i.productId.price),
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
      tax,
      grandTotal: total,
      address,
      paymentMethod,
      status: "paid",
      statusHistory: [{ status: "paid", at: new Date() }],
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
          text: `Your order ${order._id} has been placed. Total: EUR ${total}.`,
        });
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

