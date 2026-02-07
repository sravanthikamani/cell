const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/* GET REVIEWS FOR A PRODUCT */
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE OR UPDATE REVIEW */
router.post(
  "/",
  auth,
  [
    body("productId").isString().notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid review data" });
    }
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const review = await Review.findOneAndUpdate(
      { productId, userId },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("userId", "email");

    res.json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate review" });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
