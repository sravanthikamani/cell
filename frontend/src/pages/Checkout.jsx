import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StripeWrapper from "../components/StripeWrapper";
import { API_BASE } from "../lib/api";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

function CheckoutForm({ clientSecret, couponCode }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { refreshCart } = useCart();
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    setErrorMsg("");
    if (!stripe || !elements) {
      setErrorMsg("Stripe is not ready yet. Please try again.");
      return;
    }
    setIsPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required",
    });

    if (error) {
      console.error("Stripe confirmPayment error:", error);
      setErrorMsg(error.message || "Payment failed. Please try again.");
      setIsPaying(false);
      return;
    }

    try {
      const orderRes = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          address: {},
          paymentMethod: "stripe",
          couponCode,
        }),
      });
      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Order failed");
      }

      refreshCart();
      navigate("/orders");
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg(err.message || "Order creation failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };


  return (
    <>
      <PaymentElement />
      {errorMsg && (
        <div className="mt-3 text-sm text-red-600">{errorMsg}</div>
      )}
      <button
        onClick={handlePay}
        className="w-full mt-6 bg-teal-600 text-white py-2 disabled:opacity-60"
        disabled={isPaying || !stripe || !elements}
      >
        {isPaying ? "Processing..." : "Pay Now"}
      </button>
    </>
  );
}

export default function Checkout() {
  const { user, token } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  const createIntent = async (code = "") => {
    const res = await fetch(
      `${API_BASE}/api/payments/create-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, couponCode: code }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create payment intent");
    }
    setClientSecret(data.clientSecret);
    setTotals({
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      tax: data.tax || 0,
      shipping: data.shipping || 0,
      total: data.total || 0,
    });
  };

  useEffect(() => {
    if (!user || !token) return;
    createIntent("").catch(() => {});
  }, [user, token]);

  if (!clientSecret) return <div className="p-10">Loading payment...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>

      <div className="card p-4 mb-4 animate-fade-up">
        <div className="text-sm">Subtotal: ₹{totals.subtotal}</div>
        {totals.discount > 0 && (
          <div className="text-sm text-green-700">
            Discount: -₹{totals.discount}
          </div>
        )}
        {totals.tax > 0 && (
          <div className="text-sm">Tax: ₹{totals.tax}</div>
        )}
        {totals.shipping > 0 && (
          <div className="text-sm">Shipping: ₹{totals.shipping}</div>
        )}
        <div className="font-semibold mt-2">
          Total: ₹{totals.total}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-2 flex-1 rounded"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button
          className="btn-secondary"
          onClick={async () => {
            try {
              await createIntent(couponCode);
              setCouponMsg("Coupon applied");
            } catch (e) {
              setCouponMsg(e.message);
            }
          }}
        >
          Apply
        </button>
      </div>
      {couponMsg && (
        <div className="text-sm text-gray-600 mb-4">{couponMsg}</div>
      )}

      <StripeWrapper clientSecret={clientSecret}>
        <CheckoutForm clientSecret={clientSecret} couponCode={couponCode} />
      </StripeWrapper>
    </div>
  );
}
