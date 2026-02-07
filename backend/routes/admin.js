const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

/* ===============================
   ADD PRODUCT (ADMIN)
================================ */
router.post(
  "/products",
  auth,
  [
    body("name").isString().notEmpty(),
    body("price").isNumeric(),
    body("brand").isString().notEmpty(),
    body("group").isString().notEmpty(),
    body("type").isString().notEmpty(),
    body("stock").optional().isInt({ min: 0 }),
    body("sizes").optional().isArray(),
    body("colors").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid product data" });
    }
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const product = await Product.create({
      ...req.body,
      brand: req.body.brand.toLowerCase(),
    });

    res.json(product); // ✅ IMPORTANT
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   UPDATE PRODUCT
================================ */
router.put(
  "/products/:id",
  auth,
  [
    body("name").optional().isString(),
    body("price").optional().isNumeric(),
    body("brand").optional().isString(),
    body("group").optional().isString(),
    body("type").optional().isString(),
    body("stock").optional().isInt({ min: 0 }),
    body("sizes").optional().isArray(),
    body("colors").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid product data" });
    }
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   DELETE PRODUCT
================================ */
router.delete("/products/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET ALL ORDERS (ADMIN)
================================ */
router.get("/orders/all", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const orders = await Order.find().populate("items.productId");
  res.json(orders); // ✅ MUST return array
});

/* ===============================
   UPDATE ORDER STATUS
================================ */
router.put("/orders/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const order = await Order.findById(req.params.id);
  const nextStatus = req.body.status;
  const allowed = ["pending", "paid", "shipped", "delivered", "cancelled", "placed"];
  if (nextStatus) {
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    order.status = nextStatus;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: nextStatus, at: new Date() });

    if (nextStatus === "shipped") order.shippedAt = new Date();
    if (nextStatus === "delivered") order.deliveredAt = new Date();
    if (nextStatus === "cancelled") order.cancelledAt = new Date();
  }

  if (req.body.trackingNumber !== undefined) {
    order.trackingNumber = req.body.trackingNumber;
  }
  if (req.body.carrier !== undefined) {
    order.carrier = req.body.carrier;
  }
  await order.save();

  try {
    const user = await User.findById(order.userId);
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: "Order status update",
        text: `Your order ${order._id} status is now ${order.status}.`,
      });
    }
  } catch {
    // ignore email failures
  }

  res.json(order);
});

/* ===============================
   IMAGE UPLOAD (ADMIN)
================================ */
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const urlPath = `/uploads/${req.file.filename}`;
  res.json({ url: urlPath });
});

/* ===============================
   COUPONS (ADMIN)
================================ */
router.get("/coupons", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const list = await Coupon.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post("/coupons", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const data = {
    ...req.body,
    code: String(req.body.code || "").toUpperCase(),
  };
  const coupon = await Coupon.create(data);
  res.json(coupon);
});

router.put("/coupons/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (req.body.code) req.body.code = String(req.body.code).toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(coupon);
});

router.delete("/coupons/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ===============================
   ANALYTICS (ADMIN)
================================ */
router.get("/analytics", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const match = { status: { $ne: "cancelled" } };

  const totals = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$grandTotal" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const topProducts = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        qty: { $sum: "$items.qty" },
        revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  const ordersByDay = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$grandTotal" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    totalSales: totals[0]?.totalSales || 0,
    totalOrders: totals[0]?.totalOrders || 0,
    topProducts,
    ordersByDay,
  });
});

module.exports = router;
