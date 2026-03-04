const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = "CELL_SECRET_KEY";
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeRole = (role = "") => {
  const value = String(role || "").trim().toLowerCase();
  if (["admin", "administrator", "superadmin", "super_admin"].includes(value)) {
    return "admin";
  }
  return value;
};
const ADMIN_EMAILS = new Set(
  String(process.env.ADMIN_EMAILS || "admin@test.com")
    .split(",")
    .map((v) => normalizeEmail(v))
    .filter(Boolean)
);
const resolveRole = (user) => {
  const email = normalizeEmail(user?.email);
  if (email && ADMIN_EMAILS.has(email)) return "admin";
  return normalizeRole(user?.role);
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
  const normalizedRole = resolveRole(user);
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
