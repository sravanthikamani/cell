import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { API_BASE } from "../lib/api";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";

export default function OrderConfirmation() {
  const { token } = useAuth();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(location.state?.order || null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");
  const orderId = searchParams.get("orderId");
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (!paymentIntentId || !token) return;
    fetch(`${API_BASE}/api/payments/status/${paymentIntentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payment status");
        return data;
      })
      .then(setPaymentInfo)
      .catch((err) => setError(err.message));
  }, [paymentIntentId, token]);

  useEffect(() => {
    const targetOrderId = orderId || paymentInfo?.orderId;
    if (order || !targetOrderId || !token) return;
    fetch(`${API_BASE}/api/orders/details/${targetOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        return data;
      })
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [order, orderId, paymentInfo?.orderId, token]);

  const displayPaymentStatus = paymentInfo?.paymentStatus || redirectStatus || order?.paymentStatus || "";
  const isSuccess = ["succeeded", "paid"].includes(displayPaymentStatus) || order?.status === "paid";
  const isProcessing = displayPaymentStatus === "processing";
  const isFailure = ["failed", "requires_payment_method"].includes(displayPaymentStatus);
  const isCancelled = displayPaymentStatus === "cancelled";

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Seo
          title="Order Confirmation"
          description="View your order confirmation details."
          canonicalPath="/order-confirmation"
          noindex
        />
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!order && paymentIntentId && paymentInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10">
        <Seo
          title="Payment Status"
          description="View your payment status."
          canonicalPath="/order-confirmation"
          noindex
        />

        <div className="card p-5">
          <h1 className="text-2xl font-bold mb-2">
            {isSuccess ? "Payment Successful" : "Payment Update"}
          </h1>
          <p className="text-sm text-gray-700 mb-4">
            {isProcessing && "Your payment is processing. Please check back in a moment."}
            {isFailure && "Your payment did not complete. No order was confirmed."}
            {isCancelled && "Your payment was cancelled before completion."}
            {isSuccess && "Your payment succeeded. If the order page does not appear shortly, please contact support."}
            {!isSuccess && !isProcessing && !isFailure && !isCancelled && "We are checking your payment status."}
          </p>

          <div className="text-sm space-y-1 mb-4">
            <div><span className="font-medium">Payment ID:</span> {paymentInfo.paymentId}</div>
            <div><span className="font-medium">Payment Status:</span> {paymentInfo.stripeStatus}</div>
            <div><span className="font-medium">Amount:</span> {formatCurrency(paymentInfo.amount || 0, lang)}</div>
          </div>

          <div className="flex gap-3">
            <Link to="/checkout" className="border px-4 py-2 rounded text-sm">
              Back to Checkout
            </Link>
            <Link to="/" className="border px-4 py-2 rounded text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Seo
          title="Order Confirmation"
          description="View your order confirmation details."
          canonicalPath="/order-confirmation"
          noindex
        />
        <div>{paymentIntentId ? t("Checking payment status...") : t("Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <Seo
        title="Order Confirmation"
        description="View your order confirmation details."
        canonicalPath="/order-confirmation"
        noindex
      />

      <div className="card p-5">
        <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
        <p className="text-sm text-gray-700 mb-4">
          {isSuccess && "Thank you. Your payment was successful and your order is confirmed."}
          {isProcessing && "Your payment is processing. We received your order and will confirm it soon."}
          {isFailure && "Your payment did not complete. Please try again or use a different payment method."}
          {isCancelled && "Your payment was cancelled. No confirmed charge was recorded."}
          {!isSuccess && !isProcessing && !isFailure && !isCancelled && "Your order has been received."}
        </p>

        <div className="text-sm space-y-1 mb-4">
          <div><span className="font-medium">Order ID:</span> {order._id}</div>
          <div><span className="font-medium">Status:</span> {order.status}</div>
          <div><span className="font-medium">Payment:</span> {order.paymentMethod || "card"}</div>
          {(paymentInfo?.stripeStatus || order.paymentStatus) && (
            <div>
              <span className="font-medium">Payment Status:</span>{" "}
              {paymentInfo?.stripeStatus || order.paymentStatus}
            </div>
          )}
          <div><span className="font-medium">Shipping:</span> {order.shippingOption || "standard"}</div>
        </div>

        <div className="border rounded p-3 mb-4">
          <div className="font-medium mb-1">Shipping Address</div>
          <div className="text-sm text-gray-700">
            {order.address?.name}, {order.address?.phone}
          </div>
          <div className="text-sm text-gray-700">
            {order.address?.street}, {order.address?.city} - {order.address?.pincode}
          </div>
        </div>

        <div className="border rounded p-3 mb-4">
          <div className="font-medium mb-1">Order Summary</div>
          <div className="text-sm">{t("Subtotal:")} {formatCurrency(order.subtotal ?? order.total, lang)}</div>
          {order.discount > 0 && (
            <div className="text-sm">{t("Discount:")} -{formatCurrency(order.discount, lang)}</div>
          )}
          {order.tax > 0 && (
            <div className="text-sm">{t("Tax:")} {formatCurrency(order.tax, lang)}</div>
          )}
          {order.shipping > 0 && (
            <div className="text-sm">{t("Shipping:")} {formatCurrency(order.shipping, lang)}</div>
          )}
          <div className="text-sm font-semibold">
            {t("Total:")} {formatCurrency(order.grandTotal ?? order.total, lang)}
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/orders" className="bg-teal-600 text-white px-4 py-2 rounded text-sm">
            View Orders
          </Link>
          {(isFailure || isCancelled) && (
            <Link to="/checkout" className="border px-4 py-2 rounded text-sm">
              Try Payment Again
            </Link>
          )}
          <Link to="/" className="border px-4 py-2 rounded text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
