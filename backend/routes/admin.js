const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

/* ===============================
   ADD PRODUCT (ADMIN)
================================ */
router.post("/products", auth, async (req, res) => {
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
router.put("/products/:id", auth, async (req, res) => {
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
  order.status = req.body.status;
  await order.save();

  res.json(order);
});

module.exports = router;
