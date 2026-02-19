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
const fs = require("fs");
const sharp = require("sharp");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

const parsePagination = (req) => {
  const rawPage = Number(req.query.page || 1);
  const rawLimit = Number(req.query.limit || 20);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Math.min(
    100,
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 20
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

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
   LIST PRODUCTS (ADMIN)
================================ */
router.get("/products", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { page, limit, skip } = parsePagination(req);
  const q = String(req.query.q || "").trim();
  const filter = {};

  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: new RegExp(safe, "i") },
      { brand: new RegExp(safe, "i") },
      { type: new RegExp(safe, "i") },
      { group: new RegExp(safe, "i") },
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return res.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
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

  const { page, limit, skip } = parsePagination(req);
  const status = String(req.query.status || "").trim();
  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    items: orders,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
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
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const optimizedName = `${fileBase}.webp`;
    const thumbName = `${fileBase}-thumb.webp`;

    const optimizedPath = path.join(uploadDir, optimizedName);
    const thumbPath = path.join(uploadDir, thumbName);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(optimizedPath);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(thumbPath);

    return res.json({
      url: `/uploads/${optimizedName}`,
      thumbnailUrl: `/uploads/${thumbName}`,
      format: "webp",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
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

/* ===============================
   USER MANAGEMENT (ADMIN)
================================ */
router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { page, limit, skip } = parsePagination(req);
  const q = String(req.query.q || "").trim();
  const role = String(req.query.role || "").trim();
  const blocked = String(req.query.blocked || "").trim();
  const filter = {};

  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { email: new RegExp(safe, "i") },
      { name: new RegExp(safe, "i") },
      { phone: new RegExp(safe, "i") },
    ];
  }
  if (role && ["admin", "user"].includes(role)) {
    filter.role = role;
  }
  if (blocked === "true" || blocked === "false") {
    filter.isBlocked = blocked === "true";
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -resetTokenHash -resetTokenExpires -emailVerificationTokenHash -emailVerificationExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  res.json({
    items: users,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.put("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { role, isBlocked } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (role !== undefined) {
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    user.role = role;
  }

  if (isBlocked !== undefined) {
    user.isBlocked = Boolean(isBlocked);
  }

  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.resetTokenHash;
  delete safeUser.resetTokenExpires;
  delete safeUser.emailVerificationTokenHash;
  delete safeUser.emailVerificationExpires;
  res.json(safeUser);
});

router.delete("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (String(req.user.id) === String(req.params.id)) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

module.exports = router;
