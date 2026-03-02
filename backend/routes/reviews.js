const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "reviews");
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
    body("rating").isFloat({ min: 1, max: 5 }),
    body("comment").optional().isString().isLength({ max: 500 }),
    body("realImages").optional().isArray({ max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid review data" });
    }
  try {
    const { productId, rating, comment, realImages } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const review = await Review.findOneAndUpdate(
      { productId, userId },
      {
        rating: Number(rating),
        comment,
        realImages: Array.isArray(realImages) ? realImages.slice(0, 5) : [],
      },
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

/* UPLOAD REAL REVIEW IMAGE */
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const optimizedName = `${fileBase}.webp`;
    const optimizedPath = path.join(uploadDir, optimizedName);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(optimizedPath);

    return res.json({ url: `/uploads/reviews/${optimizedName}`, format: "webp" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
});

/* EDIT REVIEW */
router.put(
  "/:reviewId",
  auth,
  [
    body("rating").isFloat({ min: 1, max: 5 }),
    body("comment").optional().isString().isLength({ max: 500 }),
    body("realImages").optional().isArray({ max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid review data" });
    }
    try {
      const { rating, comment, realImages } = req.body;
      const updated = await Review.findOneAndUpdate(
        { _id: req.params.reviewId, userId: req.user.id },
        {
          rating: Number(rating),
          comment,
          realImages: Array.isArray(realImages) ? realImages.slice(0, 5) : [],
        },
        { new: true }
      ).populate("userId", "email");

      if (!updated) {
        return res.status(404).json({ error: "Review not found" });
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

/* DELETE REVIEW */
router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const deleted = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Review not found" });
    }
    return res.json({ success: true, reviewId: req.params.reviewId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
