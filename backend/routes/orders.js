const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const PDFDocument = require("pdfkit");
const { normalizePrice } = require("../utils/price");

/* PLACE ORDER */
router.post("/place", auth, async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  const total = cart.items.reduce(
    (sum, i) => sum + normalizePrice(i.productId.price) * i.qty,
    0
  );

  const orderItems = cart.items.map((i) => ({
    productId: i.productId._id || i.productId,
    qty: i.qty,
    price: normalizePrice(i.productId.price),
    variant: i.variant || {},
  }));

  const order = await Order.create({
    userId,
    items: orderItems,
    address,
    total,
    status: "pending",
  });

  res.json(order);
});

/* GET USER ORDERS */
router.get("/:userId", auth, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  const normalizedOrders = orders.map((order) => {
    const plain = order.toObject();
    plain.items = (plain.items || []).map((item) => ({
      ...item,
      price: normalizePrice(item.price ?? item.productId?.price ?? 0),
    }));
    plain.subtotal = normalizePrice(plain.subtotal ?? plain.total ?? 0);
    plain.discount = normalizePrice(plain.discount ?? 0);
    plain.shipping = normalizePrice(plain.shipping ?? 0);
    plain.tax = normalizePrice(plain.tax ?? 0);
    plain.total = normalizePrice(plain.total ?? 0);
    plain.grandTotal = normalizePrice(plain.grandTotal ?? plain.total ?? 0);
    return plain;
  });

  res.json(normalizedOrders);
});

/* CANCEL ORDER (USER) */
router.patch("/:orderId/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (String(order.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ error: "Order already cancelled" });
    }

    const cancellableStatuses = ["pending", "placed", "paid"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        error: "Order cannot be cancelled after shipping",
      });
    }

    for (const item of order.items || []) {
      if (!item?.productId || !item?.qty) continue;
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.qty } });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: "cancelled", at: new Date() });
    await order.save();

    const plain = order.toObject();
    plain.subtotal = normalizePrice(plain.subtotal ?? plain.total ?? 0);
    plain.discount = normalizePrice(plain.discount ?? 0);
    plain.shipping = normalizePrice(plain.shipping ?? 0);
    plain.tax = normalizePrice(plain.tax ?? 0);
    plain.total = normalizePrice(plain.total ?? 0);
    plain.grandTotal = normalizePrice(plain.grandTotal ?? plain.total ?? 0);

    return res.json(plain);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET SINGLE ORDER (owner/admin) */
router.get("/details/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.productId");
    if (!order) return res.status(404).json({ error: "Order not found" });

    const isOwner = String(order.userId) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const plain = order.toObject();
    plain.items = (plain.items || []).map((item) => ({
      ...item,
      price: normalizePrice(item.price ?? item.productId?.price ?? 0),
    }));
    plain.subtotal = normalizePrice(plain.subtotal ?? plain.total ?? 0);
    plain.discount = normalizePrice(plain.discount ?? 0);
    plain.shipping = normalizePrice(plain.shipping ?? 0);
    plain.tax = normalizePrice(plain.tax ?? 0);
    plain.total = normalizePrice(plain.total ?? 0);
    plain.grandTotal = normalizePrice(plain.grandTotal ?? plain.total ?? 0);

    return res.json(plain);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* INVOICE PDF */
router.get("/:orderId/invoice", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.productId");
    if (!order) return res.status(404).json({ error: "Order not found" });

    const isOwner = String(order.userId) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filename = `invoice-${order._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${order.createdAt?.toISOString().slice(0, 10)}`);
    doc.text(`Status: ${order.status || "placed"}`);
    doc.moveDown();

    doc.fontSize(12).text("Items:");
    doc.moveDown(0.5);

    let subtotal = 0;
    order.items.forEach((item) => {
      const name = item.productId?.name || "Item";
      const price = normalizePrice(item.price ?? item.productId?.price ?? 0);
      const qty = item.qty || 0;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      const variantText = item.variant
        ? ` (${item.variant.color || ""} ${item.variant.size || ""})`
        : "";

      doc.text(`${name}${variantText}  x${qty}  -  EUR ${lineTotal}`);
    });

    doc.moveDown();
    const discount = order.discount || 0;
    const shipping = order.shipping || 0;
    const tax = order.tax || 0;
    const grandTotal =
      order.grandTotal || Math.max(0, subtotal - discount) + shipping + tax;

    doc.fontSize(12).text(`Subtotal: EUR ${subtotal}`);
    if (discount > 0) {
      doc.text(`Discount: -EUR ${discount}`);
      if (order.couponCode) doc.text(`Coupon: ${order.couponCode}`);
    }
    if (tax > 0) doc.text(`Tax: EUR ${tax}`);
    if (shipping > 0) doc.text(`Shipping: EUR ${shipping}`);
    doc.text(`Total: EUR ${grandTotal}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
