const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

function getStripeClient() {
  const key = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key.startsWith("sk_")) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(key);
}

function mapIntentStatus(status) {
  switch (status) {
    case "succeeded":
      return { orderStatus: "paid", paymentStatus: "succeeded" };
    case "processing":
      return { orderStatus: "pending", paymentStatus: "processing" };
    case "requires_payment_method":
      return { orderStatus: "failed", paymentStatus: "failed" };
    case "canceled":
      return { orderStatus: "cancelled", paymentStatus: "cancelled" };
    default:
      return { orderStatus: "pending", paymentStatus: "pending" };
  }
}

async function sendConfirmationIfNeeded(order) {
  if (!order || order.confirmationSentAt || order.paymentStatus !== "succeeded") return;

  try {
    const user = await User.findById(order.userId);
    if (!user?.email) return;

    await sendMail({
      to: user.email,
      subject: "Order confirmation",
      text: `Your order ${order._id} has been confirmed. Total: EUR ${order.grandTotal || order.total}.`,
    });

    order.confirmationSentAt = new Date();
    await order.save();
  } catch {
    // ignore confirmation email failures
  }
}

async function syncOrderFromPaymentIntent(paymentIntent) {
  const order = await Order.findOne({ paymentId: paymentIntent.id });
  if (!order) return null;

  const { orderStatus, paymentStatus } = mapIntentStatus(paymentIntent.status);
  const nextHistoryStatus =
    orderStatus === "paid" ? "paid" : orderStatus === "failed" ? "failed" : null;

  order.paymentStatus = paymentStatus;
  order.paymentCurrency = String(paymentIntent.currency || "").toUpperCase();
  order.paymentAmount = Number(paymentIntent.amount_received || paymentIntent.amount || 0) / 100;

  if (paymentStatus === "succeeded" && order.status !== "paid") {
    order.status = "paid";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: "paid", at: new Date() });
  } else if (paymentStatus === "failed" && order.status === "pending") {
    order.status = "failed";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: "failed", at: new Date() });
  } else if (paymentStatus === "cancelled" && order.status === "pending") {
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: "cancelled", at: new Date() });
  } else if (nextHistoryStatus && !(order.statusHistory || []).some((item) => item.status === nextHistoryStatus)) {
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: nextHistoryStatus, at: new Date() });
  }

  await order.save();
  await sendConfirmationIfNeeded(order);
  return order;
}

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();

  if (!signature || !webhookSecret) {
    return res.status(400).send("Missing Stripe webhook configuration");
  }

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.processing":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await syncOrderFromPaymentIntent(event.data.object);
        break;
      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("stripe webhook failed:", err.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;
