const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const auth = require("../middleware/auth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* CREATE PAYMENT INTENT */
router.post("/create-intent", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in paise (₹100 = 10000)
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
