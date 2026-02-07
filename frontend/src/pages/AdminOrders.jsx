import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function AdminOrders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const { t } = useI18n();

  // 🔐 Auth guard
  if (!user) return <div className="p-10">{t("Loading...")}</div>;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  // 📥 Fetch all orders
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/orders/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw data;
        return data;
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">{t("Admin – Orders")}</h1>

      {orders.map(order => (
        <div key={order._id} className="card p-4 mb-4">
          <p className="font-semibold">
            {t("Order ID:")} {order._id}
          </p>
          <p>User: {order.userId}</p>
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
            {t("Download Invoice")}
          </button>

          {/* ✅ THIS IS WHERE YOUR <select> GOES */}
         <select
          value={order.status}
          onChange={(e) =>
            fetch(`${API_BASE}/api/admin/orders/${order._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: e.target.value }),
            })
          }
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="mt-2 flex gap-2">
          <input
            placeholder="Carrier"
            className="border px-2 py-1 text-sm"
            defaultValue={order.carrier || ""}
            onBlur={(e) =>
              fetch(`${API_BASE}/api/admin/orders/${order._id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ carrier: e.target.value }),
              })
            }
          />
          <input
            placeholder="Tracking #"
            className="border px-2 py-1 text-sm"
            defaultValue={order.trackingNumber || ""}
            onBlur={(e) =>
              fetch(`${API_BASE}/api/admin/orders/${order._id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ trackingNumber: e.target.value }),
              })
            }
          />
        </div>

        </div>
      ))}
    </div>
  );
}
