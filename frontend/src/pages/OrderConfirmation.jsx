import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { API_BASE } from "../lib/api";
import { formatCurrency } from "../lib/format";

export default function OrderConfirmation() {
  const { token } = useAuth();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState("");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (order || !orderId || !token) return;
    fetch(`${API_BASE}/api/orders/details/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        return data;
      })
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [order, orderId, token]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div>{t("Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <div className="card p-5">
        <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
        <p className="text-sm text-gray-700 mb-4">
          Thank you. Your order has been placed successfully.
        </p>

        <div className="text-sm space-y-1 mb-4">
          <div><span className="font-medium">Order ID:</span> {order._id}</div>
          <div><span className="font-medium">Status:</span> {order.status}</div>
          <div><span className="font-medium">Payment:</span> {order.paymentMethod || "card"}</div>
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
          <Link to="/" className="border px-4 py-2 rounded text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
