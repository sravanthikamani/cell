const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = "CELL_SECRET_KEY";
const normalizeRole = (role = "") => {
  const value = String(role || "").trim().toLowerCase();
  if (["admin", "administrator", "superadmin", "super_admin"].includes(value)) {
    return "admin";
  }
  return value;
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 2️⃣ Compare password
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 3️⃣ Create token
  const normalizedRole = normalizeRole(user.role);
  const token = jwt.sign(
    { id: user._id, role: normalizedRole },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 4️⃣ Send response
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: normalizedRole,
    },
  });
});

module.exports = router;
