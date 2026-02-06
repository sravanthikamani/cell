const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");

/* PLACE ORDER */
router.post("/", async (req, res) => {
  try {
    const { userId, address, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = cart.items.reduce(
      (sum, i) => sum + i.productId.price * i.qty,
      0
    );

    const order = await Order.create({
      userId,
      items: cart.items,
      total,
      address,
      paymentMethod,
    });

    // 🔥 CLEAR CART AFTER ORDER
    cart.items = [];
    await cart.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
