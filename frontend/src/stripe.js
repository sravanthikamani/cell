import { loadStripe } from "@stripe/stripe-js";

const publishableKey = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
