import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StripeWrapper from "../components/StripeWrapper";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { refreshCart } = useCart();

  const handlePay = async () => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required",
    });

    if (!error) {
      await fetch("http://localhost:5000/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ address: {} }),
      });

      refreshCart();
      navigate("/orders");
    }
  };

  return (
    <>
      <PaymentElement />
      <button
        onClick={handlePay}
        className="w-full mt-6 bg-teal-600 text-white py-2"
      >
        Pay Now
      </button>
    </>
  );
}

export default function Checkout() {
  const { user, token } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/payments/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ amount: 10000 }), // test ₹100
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <div className="p-10">Loading payment...</div>;

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>

      <StripeWrapper clientSecret={clientSecret}>
        <CheckoutForm clientSecret={clientSecret} />
      </StripeWrapper>
    </div>
  );
}
