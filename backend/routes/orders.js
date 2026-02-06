const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

/* PLACE ORDER */
router.post("/place", auth, async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  const total = cart.items.reduce(
    (sum, i) => sum + i.productId.price * i.qty,
    0
  );

  const order = await Order.create({
    userId,
    items: cart.items,
    address,
    total,
    status: "pending",
  });

  res.json(order); // ❗ DO NOT CLEAR CART YET
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

module.exports = router;
