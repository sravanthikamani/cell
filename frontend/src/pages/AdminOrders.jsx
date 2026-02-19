import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function AdminOrders() {
  const { user, token } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  if (!user) return <div className="p-10">{t("Loading...")}</div>;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const loadOrders = async (nextPage = page, status = statusFilter) => {
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "20",
    });
    if (status) params.set("status", status);
    const res = await fetch(`${API_BASE}/api/admin/orders/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
    setOrders(Array.isArray(data.items) ? data.items : []);
    setPage(data.page || 1);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    loadOrders(1).catch(console.error);
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">{t("Admin - Orders")}</h1>
      <div className="mb-4 flex gap-2">
        <select
          className="border p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="placed">Placed</option>
        </select>
        <button className="bg-black text-white px-3" onClick={() => loadOrders(1)}>
          Filter
        </button>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="card p-4 mb-4">
          <p className="font-semibold">{t("Order ID:")} {order._id}</p>
          <p>User: {order.userId}</p>
          <button
            className="mt-2 text-sm text-teal-700 underline"
            onClick={async () => {
              try {
                const res = await fetch(`${API_BASE}/api/orders/${order._id}/invoice`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
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
            <option value="placed">Placed</option>
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

      <div className="flex gap-2 mt-3">
        <button
          className="border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => loadOrders(page - 1)}
        >
          Prev
        </button>
        <div className="text-sm px-2 py-1">Page {page} / {totalPages}</div>
        <button
          className="border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => loadOrders(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
