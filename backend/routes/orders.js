const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const PDFDocument = require("pdfkit");

/* PLACE ORDER */
router.post("/place", auth, async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  const total = cart.items.reduce((sum, i) => sum + i.productId.price * i.qty, 0);

  const orderItems = cart.items.map((i) => ({
    productId: i.productId._id || i.productId,
    qty: i.qty,
    price: i.productId.price,
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

  res.json(orders);
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
      const price = item.productId?.price || 0;
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
