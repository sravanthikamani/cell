import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const publishableKey = String(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
).trim();
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function StripeWrapper({ clientSecret, children }) {
  if (!publishableKey) {
    return (
      <div className="text-sm text-red-600">
        Stripe is not configured. Set `VITE_STRIPE_PUBLISHABLE_KEY` on the
        frontend.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}
