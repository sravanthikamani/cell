import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StripeWrapper from "../components/StripeWrapper";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Seo from "../components/Seo";

const emptyAddress = {
  name: "",
  phone: "",
  street: "",
  city: "",
  pincode: "",
};

let paypalSdkPromise = null;
function loadPayPalSdk(clientId, currency = "EUR") {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK can only load in browser"));
  }
  if (window.paypal?.Buttons) {
    return Promise.resolve(window.paypal);
  }
  if (!clientId) {
    return Promise.reject(new Error("PayPal client ID is missing"));
  }
  if (paypalSdkPromise) return paypalSdkPromise;

  const scriptId = "paypal-sdk-script";
  const src =
    `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}` +
    `&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load PayPal SDK")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  }).catch((err) => {
    paypalSdkPromise = null;
    throw err;
  });

  return paypalSdkPromise;
}

function isAddressValid(addr) {
  return ["name", "phone", "street", "city", "pincode"].every((key) =>
    String(addr?.[key] || "").trim()
  );
}

function CheckoutForm({
  couponCode,
  paymentMethod,
  shippingOption,
  selectedAddress,
  onOrderSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    setErrorMsg("");
    if (!isAddressValid(selectedAddress)) {
      setErrorMsg("Please select or add a complete shipping address.");
      return;
    }
    if (!stripe || !elements) {
      setErrorMsg(t("Stripe is not ready yet. Please try again."));
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
      setErrorMsg(error.message || t("Payment failed. Please try again."));
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
          address: selectedAddress,
          paymentMethod,
          couponCode,
          shippingOption,
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(orderData.message || orderData.error || t("Order failed"));
      }

      onOrderSuccess(orderData);
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg(err.message || t("Order creation failed. Please try again."));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <PaymentElement />
      {errorMsg && <div className="mt-3 text-sm text-red-600">{errorMsg}</div>}
      <button
        onClick={handlePay}
        className="w-full mt-6 bg-teal-600 text-white py-2 disabled:opacity-60"
        disabled={isPaying || !stripe || !elements}
      >
        {isPaying ? t("Processing...") : t("Pay Now")}
      </button>
    </>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const { t, lang } = useI18n();
  const [clientSecret, setClientSecret] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paymentInitError, setPaymentInitError] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [shippingOption, setShippingOption] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");
  const [paypalError, setPaypalError] = useState("");
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
  const paypalButtonsRef = useRef(null);
  const paypalClientId = String(import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim();
  const paypalCurrency = String(import.meta.env.VITE_PAYPAL_CURRENCY || "EUR")
    .trim()
    .toUpperCase();

  const selectedAddress = useMemo(() => {
    if (addingAddress) return newAddress;
    return addresses[selectedAddressIndex] || emptyAddress;
  }, [addingAddress, newAddress, addresses, selectedAddressIndex]);

  const fetchProfileAddresses = async () => {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load addresses");
    const nextAddresses = Array.isArray(data.addresses) ? data.addresses : [];
    setAddresses(nextAddresses);
    if (nextAddresses.length > 0) {
      setSelectedAddressIndex(0);
      setAddingAddress(false);
    } else {
      setAddingAddress(true);
    }
  };

  const createIntent = async (
    code = couponCode,
    method = paymentMethod,
    shipping = shippingOption
  ) => {
    setPaymentInitError("");
    setIsPaymentLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          couponCode: code,
          paymentMethod: method,
          shippingOption: shipping,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }
      setClientSecret(data.clientSecret || null);
      setTotals({
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        total: data.total || 0,
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleOrderSuccess = async (order) => {
    refreshCart();
    navigate(`/order-confirmation?orderId=${order?._id || ""}`, {
      state: { order },
    });
  };

  const handleSaveAddress = async () => {
    setAddressMsg("");
    if (!isAddressValid(newAddress)) return;

    setIsSavingAddress(true);
    const next = [...addresses, newAddress];
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save address");
      }
      setAddresses(next);
      setSelectedAddressIndex(next.length - 1);
      setAddingAddress(false);
      setNewAddress(emptyAddress);
      setAddressMsg("Address saved to profile");
    } catch (err) {
      setAddressMsg(err.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    fetchProfileAddresses().catch((e) => {
      setLoadError(e.message || "Failed to load profile");
    });
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) return;
    createIntent(couponCode, paymentMethod, shippingOption).catch((e) => {
      setPaymentInitError(e.message || "Failed to initialize payment");
    });
  }, [user, token, paymentMethod, shippingOption]);

  useEffect(() => {
    if (paymentMethod !== "paypal") return;
    setPaypalError("");
    if (!paypalClientId) {
      setPaypalSdkReady(false);
      setPaypalError("PayPal is not configured on frontend.");
      return;
    }

    let cancelled = false;
    loadPayPalSdk(paypalClientId, paypalCurrency)
      .then(() => {
        if (!cancelled) setPaypalSdkReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setPaypalSdkReady(false);
          setPaypalError(err.message || "Failed to load PayPal SDK");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentMethod, paypalClientId, paypalCurrency]);

  useEffect(() => {
    if (paymentMethod !== "paypal") return;
    if (!paypalSdkReady || !window.paypal?.Buttons || !paypalButtonsRef.current) return;

    paypalButtonsRef.current.innerHTML = "";
    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "paypal" },
      createOrder: async () => {
        setPaypalError("");
        if (!isAddressValid(selectedAddress)) {
          const message = "Please select or add a complete shipping address.";
          setPaypalError(message);
          throw new Error(message);
        }

        const res = await fetch(`${API_BASE}/api/payments/paypal/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            couponCode,
            shippingOption,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Failed to create PayPal order");
        }
        setTotals({
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          tax: data.tax || 0,
          shipping: data.shipping || 0,
          total: data.total || 0,
        });
        return data.orderId;
      },
      onApprove: async (data) => {
        try {
          const orderRes = await fetch(`${API_BASE}/api/checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user?.id,
              address: selectedAddress,
              paymentMethod: "paypal",
              paypalOrderId: data?.orderID,
              couponCode,
              shippingOption,
            }),
          });
          const orderData = await orderRes.json().catch(() => ({}));
          if (!orderRes.ok) {
            throw new Error(orderData.message || orderData.error || "Order failed");
          }
          await handleOrderSuccess(orderData);
        } catch (err) {
          setPaypalError(err.message || "PayPal payment failed. Please try again.");
        }
      },
      onCancel: () => {
        setPaypalError("PayPal payment was cancelled.");
      },
      onError: (err) => {
        setPaypalError(err?.message || "PayPal payment failed. Please try again.");
      },
    });

    if (!buttons.isEligible()) {
      setPaypalError("PayPal is not available for this account/device.");
      return;
    }
    buttons.render(paypalButtonsRef.current).catch((err) => {
      setPaypalError(err?.message || "Failed to render PayPal button");
    });

    return () => {
      try {
        buttons.close();
      } catch {
        // ignore cleanup failures from SDK
      }
    };
  }, [
    paymentMethod,
    paypalSdkReady,
    token,
    user,
    couponCode,
    shippingOption,
    selectedAddress,
  ]);

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto p-6 md:p-10">
        <Seo
          title="Checkout"
          description="Complete your purchase securely."
          canonicalPath="/checkout"
          noindex
        />
        <h1 className="text-2xl font-bold mb-3">{t("Payment")}</h1>
        <div className="text-sm text-red-600">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <Seo
        title="Checkout"
        description="Complete your purchase securely."
        canonicalPath="/checkout"
        noindex
      />

      <h1 className="text-2xl font-bold mb-4">{t("Checkout")}</h1>

      <div className="card p-4 mb-4">
        <div className="font-semibold mb-2">Shipping Address</div>

        {addresses.length > 0 && (
          <div className="mb-3 space-y-2">
            {addresses.map((addr, idx) => (
              <label key={idx} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="address"
                  checked={!addingAddress && selectedAddressIndex === idx}
                  onChange={() => {
                    setAddingAddress(false);
                    setSelectedAddressIndex(idx);
                  }}
                />
                <span>
                  {addr.name}, {addr.phone}, {addr.street}, {addr.city} - {addr.pincode}
                </span>
              </label>
            ))}
          </div>
        )}

        <button
          className="text-sm text-teal-700 underline mb-3"
          onClick={() => {
            setAddressMsg("");
            setAddingAddress((v) => !v);
          }}
        >
          {addingAddress ? "Use saved address" : "Add new address"}
        </button>

        {addingAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border p-2"
              placeholder="Name"
              value={newAddress.name}
              onChange={(e) => setNewAddress((v) => ({ ...v, name: e.target.value }))}
            />
            <input
              className="border p-2"
              placeholder="Phone"
              value={newAddress.phone}
              onChange={(e) => setNewAddress((v) => ({ ...v, phone: e.target.value }))}
            />
            <input
              className="border p-2 md:col-span-2"
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) => setNewAddress((v) => ({ ...v, street: e.target.value }))}
            />
            <input
              className="border p-2"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress((v) => ({ ...v, city: e.target.value }))}
            />
            <input
              className="border p-2"
              placeholder="Pincode"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress((v) => ({ ...v, pincode: e.target.value }))}
            />
            <button
              type="button"
              className="md:col-span-2 bg-black text-white py-2 disabled:opacity-60"
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
            >
              {isSavingAddress ? "Saving..." : "Save address"}
            </button>
          </div>
        )}
        {addressMsg && <div className="text-sm mt-2 text-teal-700">{addressMsg}</div>}
      </div>

      <div className="card p-4 mb-4">
        <div className="font-semibold mb-2">Shipping Options</div>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="shippingOption"
              value="standard"
              checked={shippingOption === "standard"}
              onChange={(e) => setShippingOption(e.target.value)}
            />
            Standard Shipping
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="shippingOption"
              value="express"
              checked={shippingOption === "express"}
              onChange={(e) => setShippingOption(e.target.value)}
            />
            Express Shipping
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="shippingOption"
              value="pickup"
              checked={shippingOption === "pickup"}
              onChange={(e) => setShippingOption(e.target.value)}
            />
            Store Pickup
          </label>
        </div>
      </div>

      <div className="card p-4 mb-4 animate-fade-up">
        <div className="font-semibold mb-2">Order Summary</div>
        <div className="text-sm">{t("Subtotal:")} {formatCurrency(totals.subtotal, lang)}</div>
        {totals.discount > 0 && (
          <div className="text-sm text-green-700">
            {t("Discount:")} -{formatCurrency(totals.discount, lang)}
          </div>
        )}
        {totals.tax > 0 && (
          <div className="text-sm">{t("Tax:")} {formatCurrency(totals.tax, lang)}</div>
        )}
        {totals.shipping > 0 && (
          <div className="text-sm">{t("Shipping:")} {formatCurrency(totals.shipping, lang)}</div>
        )}
        <div className="font-semibold mt-2">
          {t("Total:")} {formatCurrency(totals.total, lang)}
        </div>
      </div>

      <form
        className="flex gap-2 mb-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createIntent(couponCode);
            setCouponMsg(t("Coupon applied"));
          } catch (err) {
            setCouponMsg(err.message);
          }
        }}
      >
        <input
          className="border px-3 py-2 flex-1 rounded"
          placeholder={t("Coupon code")}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button type="submit" className="btn-secondary">
          {t("Apply")}
        </button>
      </form>
      {couponMsg && <div className="text-sm text-gray-600 mb-4">{couponMsg}</div>}

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Payment Method</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Card
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="klarna"
              checked={paymentMethod === "klarna"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Klarna
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            PayPal
          </label>
        </div>
      </div>

      <div className="card p-4">
        {paymentMethod === "paypal" ? (
          <>
            <div className="text-sm text-gray-700 mb-3">Pay securely with PayPal.</div>
            {paypalError && <div className="mb-3 text-sm text-red-600">{paypalError}</div>}
            {!paypalSdkReady && !paypalError && (
              <div className="text-sm text-gray-600">Loading PayPal...</div>
            )}
            <div ref={paypalButtonsRef} />
          </>
        ) : (
          <>
            {paymentInitError && (
              <div className="mb-3 text-sm text-red-600">{paymentInitError}</div>
            )}
            {!clientSecret ? (
              <div className="text-sm text-gray-600">
                {isPaymentLoading ? t("Loading payment...") : t("Payment unavailable. Please try again.")}
              </div>
            ) : (
              <StripeWrapper clientSecret={clientSecret} key={clientSecret}>
                <CheckoutForm
                  couponCode={couponCode}
                  paymentMethod={paymentMethod}
                  shippingOption={shippingOption}
                  selectedAddress={selectedAddress}
                  onOrderSuccess={handleOrderSuccess}
                />
              </StripeWrapper>
            )}
          </>
        )}
      </div>
    </div>
  );
}
