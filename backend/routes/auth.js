const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sendMail } = require("../utils/mailer");

const router = express.Router();
const JWT_SECRET = "CELL_SECRET_KEY";
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const isEmailVerificationRequired = () =>
  String(process.env.REQUIRE_EMAIL_VERIFICATION || "true").toLowerCase() !== "false";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const buildFrontendBase = (req) =>
  (
    process.env.FRONTEND_URL ||
    req.get("origin") ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/+$/, "");

const issueLoginResponse = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name || "",
    },
  });
};

const ensureSocialUser = async ({ email, name = "" }) => {
  let user = await User.findOne({ email });
  if (user) {
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }
    return user;
  }

  const randomPassword = crypto.randomBytes(24).toString("hex");
  const hashed = await bcrypt.hash(randomPassword, 10);
  user = await User.create({
    email,
    name,
    password: hashed,
    role: "user",
    isEmailVerified: true,
  });
  return user;
};

/* REGISTER */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    let createdUser = null;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.warn("Register validation failed:", errors.array()[0].msg);
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const email = normalizeEmail(req.body.email);
      const { password } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "User exists" });

      const hashed = await bcrypt.hash(password, 10);
      const requireVerification = isEmailVerificationRequired();

      let verifyToken = "";
      let verifyTokenHash = "";
      if (requireVerification) {
        verifyToken = crypto.randomBytes(32).toString("hex");
        verifyTokenHash = crypto
          .createHash("sha256")
          .update(verifyToken)
          .digest("hex");
      }

      createdUser = await User.create({
        email,
        password: hashed,
        isEmailVerified: !requireVerification,
        emailVerificationTokenHash: requireVerification ? verifyTokenHash : undefined,
        emailVerificationExpires: requireVerification
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : undefined,
      });

      if (!requireVerification) {
        return res.json({ success: true });
      }

      const verifyUrl = `${buildFrontendBase(req)}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

      try {
        await sendMail({
          to: email,
          subject: "Verify your email",
          text: `Verify your account using this link: ${verifyUrl}`,
        });
        return res.json({ success: true });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Verification email skipped:", err.message);
          console.info("Email verification URL:", verifyUrl);
          return res.json({ success: true, devVerificationUrl: verifyUrl });
        }

        if (createdUser?._id) {
          await User.deleteOne({ _id: createdUser._id }).catch(() => {});
        }

        console.error("Register email send failed:", err.message);
        return res.status(503).json({
          error:
            "Registration temporarily unavailable. Email service is not configured.",
        });
      }
    } catch (err) {
      console.error("Register failed:", err.message);
      return res.status(500).json({ error: "Registration failed" });
    }
  }
);

/* GOOGLE SOCIAL LOGIN */
router.post(
  "/social/google",
  [body("credential").notEmpty().withMessage("Google credential is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: "Google login is not configured" });
      }

      const { credential } = req.body;
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = normalizeEmail(payload?.email);

      if (!email) {
        return res.status(400).json({ error: "Google account email not available" });
      }

      const user = await ensureSocialUser({
        email,
        name: String(payload?.name || "").trim(),
      });
      return issueLoginResponse(res, user);
    } catch (err) {
      console.error("Google social login error:", err.message);
      return res.status(401).json({ error: "Google authentication failed" });
    }
  }
);

/* FACEBOOK SOCIAL LOGIN */
router.post(
  "/social/facebook",
  [body("accessToken").notEmpty().withMessage("Facebook access token is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { accessToken } = req.body;
      const fbRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
      );
      const fbData = await fbRes.json();

      if (!fbRes.ok || fbData.error) {
        return res.status(401).json({ error: "Facebook authentication failed" });
      }

      const email = normalizeEmail(fbData.email);
      if (!email) {
        return res.status(400).json({
          error: "Facebook account email not available. Use Google or email login.",
        });
      }

      const user = await ensureSocialUser({
        email,
        name: String(fbData.name || "").trim(),
      });
      return issueLoginResponse(res, user);
    } catch (err) {
      console.error("Facebook social login error:", err.message);
      return res.status(401).json({ error: "Facebook authentication failed" });
    }
  }
);

/* LOGIN */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    console.warn("Login failed: user not found", { email });
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    console.warn("Login failed: password mismatch", { email });
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (isEmailVerificationRequired() && !user.isEmailVerified) {
    return res.status(403).json({ error: "Please verify your email before login" });
  }

  return issueLoginResponse(res, user);
  }
);

/* VERIFY EMAIL */
router.get(
  "/verify-email",
  async (req, res) => {
    try {
      const email = normalizeEmail(req.query.email);
      const token = String(req.query.token || "").trim();

      if (!email || !token) {
        return res.status(400).json({ error: "Email and token are required" });
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        email,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification link" });
      }

      user.isEmailVerified = true;
      user.emailVerificationTokenHash = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return res.json({ success: true });
    } catch (err) {
      console.error("Verify-email error:", err.message);
      return res.status(500).json({ error: "Failed to verify email" });
    }
  }
);

/* FORGOT PASSWORD */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn("Reset-password validation failed:", errors.array()[0].msg);
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetTokenHash = tokenHash;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendBase = buildFrontendBase(req);
    const resetUrl = `${frontendBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendMail({
        to: email,
        subject: "Reset your password",
        text: `Reset your password using this link: ${resetUrl}`,
      });
    } catch (err) {
      // In local/dev, do not block the flow if SMTP is not configured.
      if (process.env.NODE_ENV !== "production") {
        console.warn("Forgot-password email skipped:", err.message);
        console.info("Password reset URL:", resetUrl);
        return res.json({ success: true, devResetUrl: resetUrl });
      }
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.json({ success: true });
  }
);

/* RESET PASSWORD */
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const email = normalizeEmail(req.body.email);
    const { token, password } = req.body;
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      console.warn("Reset-password failed: invalid or expired token", {
        email,
      });
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ success: true });
  }
);

module.exports = router;
