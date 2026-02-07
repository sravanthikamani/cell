const express = require("express");
const auth = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");

const router = express.Router();

/* GET MY WISHLIST */
router.get("/", auth, async (req, res) => {
  const list = await Wishlist.findOne({ userId: req.user.id }).populate(
    "products"
  );
  res.json(list || { products: [] });
});

/* ADD TO WISHLIST */
router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Missing productId" });

  const list = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate("products");

  res.json(list);
});

/* REMOVE FROM WISHLIST */
router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Missing productId" });

  const list = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { products: productId } },
    { new: true }
  ).populate("products");

  res.json(list || { products: [] });
});

module.exports = router;
