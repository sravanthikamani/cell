const nodemailer = require("nodemailer");

function buildTransporter() {
  const SMTP_HOST = (process.env.SMTP_HOST || "").trim();
  const SMTP_PORT = (process.env.SMTP_PORT || "").trim();
  const SMTP_SECURE = (process.env.SMTP_SECURE || "").trim();
  const SMTP_USER = (process.env.SMTP_USER || "").trim();
  // App-passwords are often copied with spaces; strip them to avoid auth failures.
  const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE || "false").toLowerCase() === "true",
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text }) {
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials missing");
  }
  const transporter = buildTransporter();
  return transporter.sendMail({
    from: (process.env.SMTP_FROM || smtpUser).trim(),
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
