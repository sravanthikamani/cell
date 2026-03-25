const NotificationSubscriber = require("../models/NotificationSubscriber");
const { sendMail } = require("./mailer");

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

async function sendWelcomeNotificationEmail(email) {
  const safeEmail = normalizeEmail(email);
  if (!safeEmail) {
    throw new Error("Email is required");
  }

  return sendMail({
    to: safeEmail,
    subject: "Welcome to hitechCinisello",
    text: [
      "Welcome to hitechCinisello.",
      "",
      "Thanks for subscribing to Notify Me updates.",
      "You will now receive early alerts about new offers, special sales, and coupon drops.",
      "",
      "We will keep the updates useful and focused on real savings.",
      "",
      "See you soon,",
      "The hitechCinisello Team",
    ].join("\n"),
  });
}

async function notifySubscribers({ subject, lines = [] }) {
  const subscribers = await NotificationSubscriber.find(
    { isActive: true },
    { email: 1 }
  ).lean();

  if (!subscribers.length) {
    return { attempted: 0, sent: 0, failed: 0 };
  }

  const text = lines.filter(Boolean).join("\n");
  const results = await Promise.allSettled(
    subscribers.map((subscriber) =>
      sendMail({
        to: subscriber.email,
        subject,
        text,
      })
    )
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;

  await NotificationSubscriber.updateMany(
    { isActive: true },
    { $set: { lastNotifiedAt: new Date() } }
  );

  return {
    attempted: results.length,
    sent,
    failed,
  };
}

async function notifySubscribersAboutOffer(offer) {
  const productNames = (offer?.productIds || [])
    .map((product) => String(product?.name || "").trim())
    .filter(Boolean)
    .slice(0, 5);

  const endsAtText = offer?.endsAt ? new Date(offer.endsAt).toLocaleString("en-GB") : "";
  const discountLabel =
    String(offer?.discountType || "").toLowerCase() === "fixed"
      ? `EUR ${Number(offer?.discountValue || 0)} off`
      : `${Number(offer?.discountValue || 0)}% off`;

  return notifySubscribers({
    subject: `New offer at hitechCinisello: ${offer?.title || "Special Offer"}`,
    lines: [
      `A new offer is now live at hitechCinisello: ${offer?.title || "Special Offer"}.`,
      "",
      `Discount: ${discountLabel}`,
      endsAtText ? `Offer ends: ${endsAtText}` : "",
      productNames.length ? `Featured products: ${productNames.join(", ")}` : "",
      "",
      "Visit hitechCinisello to explore the latest deal before it ends.",
      "",
      "The hitechCinisello Team",
    ],
  });
}

async function notifySubscribersAboutCoupon(coupon) {
  const discountLabel =
    String(coupon?.type || "").toLowerCase() === "fixed"
      ? `EUR ${Number(coupon?.value || 0)} off`
      : `${Number(coupon?.value || 0)}% off`;
  const expiresAtText = coupon?.expiresAt
    ? new Date(coupon.expiresAt).toLocaleString("en-GB")
    : "";

  return notifySubscribers({
    subject: `New coupon from hitechCinisello: ${coupon?.code || "SPECIAL"}`,
    lines: [
      `A new coupon is available at hitechCinisello: ${coupon?.code || "SPECIAL"}.`,
      "",
      `Discount: ${discountLabel}`,
      expiresAtText ? `Valid until: ${expiresAtText}` : "",
      Number(coupon?.minTotal || 0) > 0 ? `Minimum order: EUR ${Number(coupon.minTotal)}` : "",
      Number(coupon?.maxDiscount || 0) > 0 ? `Maximum discount: EUR ${Number(coupon.maxDiscount)}` : "",
      "",
      "Use it on your next order while it is active.",
      "",
      "The hitechCinisello Team",
    ],
  });
}

module.exports = {
  normalizeEmail,
  sendWelcomeNotificationEmail,
  notifySubscribersAboutOffer,
  notifySubscribersAboutCoupon,
};
