const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials missing");
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
