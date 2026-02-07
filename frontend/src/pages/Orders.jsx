import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";

export default function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);

  // ✅ STOP until user exists
  if (!user) {
    return <div className="p-10">Loading orders...</div>;
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/orders/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw data;
        return data;
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [user, token]);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          className="card p-4 mb-4"
        >
          <p className="font-semibold">
            Order ID: {order._id}
          </p>
          <p>Status: {order.status}</p>
          {order.carrier && order.trackingNumber && (
            <p className="text-sm text-gray-600">
              {order.carrier}: {order.trackingNumber}
            </p>
          )}
          <div className="text-sm text-gray-700 mt-2">
            <div>Subtotal: ₹{order.subtotal ?? order.total}</div>
            {order.discount > 0 && (
              <div>Discount: -₹{order.discount}</div>
            )}
            {order.couponCode && (
              <div>Coupon: {order.couponCode}</div>
            )}
            {order.tax > 0 && <div>Tax: ₹{order.tax}</div>}
            {order.shipping > 0 && (
              <div>Shipping: ₹{order.shipping}</div>
            )}
            <div className="font-semibold">
              Total: ₹{order.grandTotal ?? order.total}
            </div>
          </div>
          <button
            className="mt-2 text-sm text-teal-700 underline"
            onClick={async () => {
              try {
                const res = await fetch(
                  `${API_BASE}/api/orders/${order._id}/invoice`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (!res.ok) throw new Error("Failed to download invoice");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `invoice-${order._id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
              }
            }}
          >
            Download Invoice
          </button>

          <div className="mt-2">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between text-sm"
              >
                <span>{item.productId.name}</span>
                {(item.variant?.color || item.variant?.size) && (
                  <span className="text-gray-600">
                    {item.variant?.color || ""} {item.variant?.size || ""}
                  </span>
                )}
                <span>Qty: {item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
