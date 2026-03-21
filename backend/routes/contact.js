const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, phone, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required." });
  }

  try {
    // Configure your SMTP transport (use environment variables in production)
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "your@email.com",
        pass: process.env.SMTP_PASS || "password",
      },
    });

    await transporter.sendMail({
      from: `Contact Form <${process.env.SMTP_USER || "your@email.com"}>`,
      to: "info@hitechcinisello.it",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nPhone: ${phone || "-"}\nMessage: ${message}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Phone:</b> ${phone || "-"}</p><p><b>Message:</b><br/>${message.replace(/\n/g, "<br/>")}</p>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

module.exports = router;
