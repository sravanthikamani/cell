const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

/* GET MY PROFILE */
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

/* UPDATE MY PROFILE */
router.put(
  "/me",
  auth,
  [
    body("name").optional().isString(),
    body("phone").optional().isString(),
    body("addresses").optional().isArray(),
    body("profileImage").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid profile data" });
    }

    const { name, phone, addresses, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  }
);

/* UPLOAD PROFILE IMAGE */
router.post("/me/upload-image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBase = `profile-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const imageName = `${fileBase}.webp`;
    const imagePath = path.join(uploadDir, imageName);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 512, height: 512, fit: "cover" })
      .webp({ quality: 82 })
      .toFile(imagePath);

    const user = await User.findById(req.user.id);
    user.profileImage = `/uploads/profiles/${imageName}`;
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
