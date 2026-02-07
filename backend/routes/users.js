const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid profile data" });
    }

    const { name, phone, addresses } = req.body;
    const user = await User.findById(req.user.id);

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  }
);

module.exports = router;
