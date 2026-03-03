require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const email = String(process.argv[2] || process.env.ADMIN_EMAIL || "admin@test.com")
  .trim()
  .toLowerCase();
const password = String(process.argv[3] || process.env.ADMIN_PASSWORD || "").trim();
const resetPassword = String(process.argv[4] || "").trim().toLowerCase() === "--reset-password";
const name = String(process.env.ADMIN_NAME || "Admin").trim() || "Admin";
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cell";

(async () => {
  try {
    await mongoose.connect(uri);
    const existing = await User.findOne({ email });

    if (!existing) {
      if (!password) {
        console.error(
          "UPDATE_ERROR= Admin user does not exist. Provide password as arg2 or ADMIN_PASSWORD env to create it."
        );
        process.exitCode = 1;
        return;
      }

      const hashed = await bcrypt.hash(password, 10);
      const created = await User.create({
        email,
        password: hashed,
        name,
        role: "admin",
        isBlocked: false,
        isEmailVerified: true,
      });

      console.log("ACTION= created");
      console.log(
        "ADMIN_USER_AFTER=",
        JSON.stringify({
          _id: created._id,
          email: created.email,
          role: created.role,
          isBlocked: created.isBlocked,
          isEmailVerified: created.isEmailVerified,
        })
      );
      return;
    }

    if (password && resetPassword) {
      existing.password = await bcrypt.hash(password, 10);
    }

    existing.role = "admin";
    existing.isBlocked = false;
    existing.isEmailVerified = true;
    await existing.save();

    const user = await User.findOne({ email }).select("email role isBlocked isEmailVerified");
    console.log("ACTION= updated");
    console.log("ADMIN_USER_AFTER=", JSON.stringify(user));
  } catch (err) {
    console.error("UPDATE_ERROR=", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();
