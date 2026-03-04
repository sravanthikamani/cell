import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { isAdminRole } from "../lib/auth";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "placed",
];

const statusBadgeClass = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  placed: "bg-slate-100 text-slate-800",
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useAuth();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get("page") || 1) || 1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [savingOrderId, setSavingOrderId] = useState("");
  const [draftByOrderId, setDraftByOrderId] = useState({});
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("shipped");
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!user) return <div className="p-10">{t("Loading...")}</div>;
  if (!isAdminRole(user.role)) return <Navigate to="/" replace />;

  const hydrateDrafts = (items) => {
    const next = {};
    (items || []).forEach((order) => {
      next[order._id] = {
        status: order.status || "pending",
        carrier: order.carrier || "",
        trackingNumber: order.trackingNumber || "",
      };
    });
    setDraftByOrderId(next);
  };

  const buildParams = (nextPage, limit = "20", override = {}) => {
    const nextStatus = override.statusFilter ?? statusFilter;
    const nextQ = override.q ?? q;
    const nextSort = override.sortBy ?? sortBy;
    const nextDateFrom = override.dateFrom ?? dateFrom;
    const nextDateTo = override.dateTo ?? dateTo;

    const params = new URLSearchParams({
      page: String(nextPage),
      limit,
    });

    if (nextStatus) params.set("status", nextStatus);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextSort) params.set("sort", nextSort);
    if (nextDateFrom) params.set("dateFrom", nextDateFrom);
    if (nextDateTo) params.set("dateTo", nextDateTo);

    return params;
  };

  const fetchOrdersPage = async (nextPage = 1, override = {}, limit = "20") => {
    const params = buildParams(nextPage, limit, override);

    const res = await fetch(`${API_BASE}/api/admin/orders/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
    return { data, params };
  };

  const loadOrders = async (nextPage = 1, override = {}, syncUrl = true) => {
    setLoading(true);
    setError("");
    setActionMsg("");
    const { data, params } = await fetchOrdersPage(nextPage, override, "20");

    if (syncUrl) {
      setSearchParams(params, { replace: true });
    }

    const items = Array.isArray(data.items) ? data.items : [];
    setOrders(items);
    hydrateDrafts(items);
    setSelectedOrderIds([]);
    setPage(data.page || 1);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  const updateOrderRequest = async (orderId, payload) => {
    const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update order");
    return data;
  };

  const setDraftField = (orderId, field, value) => {
    setDraftByOrderId((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const updateOrder = async (orderId, payload, successMsg) => {
    setSavingOrderId(orderId);
    setError("");
    setActionMsg("");
    try {
      const data = await updateOrderRequest(orderId, payload);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...data,
              }
            : order
        )
      );
      setDraftByOrderId((prev) => ({
        ...prev,
        [orderId]: {
          status: data.status || prev[orderId]?.status || "pending",
          carrier: data.carrier || "",
          trackingNumber: data.trackingNumber || "",
        },
      }));
      setActionMsg(successMsg);
    } catch (err) {
      setError(err.message || "Failed to update order");
    } finally {
      setSavingOrderId("");
    }
  };

  const onStatusChange = async (orderId, nextStatus) => {
    setDraftField(orderId, "status", nextStatus);
    await updateOrder(orderId, { status: nextStatus }, "Order status updated");
  };

  const onSaveShipping = async (orderId) => {
    const draft = draftByOrderId[orderId] || {};
    await updateOrder(
      orderId,
      {
        carrier: draft.carrier || "",
        trackingNumber: draft.trackingNumber || "",
      },
      "Shipping details saved"
    );
  };

  useEffect(() => {
    loadOrders(page || 1, {}, false).catch((err) => {
      setError(err.message || "Failed to fetch orders");
      setLoading(false);
    });
  }, [token]);

  useEffect(() => {
    document.body.classList.add("orders-bg-active");
    return () => {
      document.body.classList.remove("orders-bg-active");
    };
  }, []);

  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-IE", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [lang]
  );

  const allVisibleSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedOrderIds([]);
      return;
    }
    setSelectedOrderIds(orders.map((o) => o._id));
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) return;
    setIsBulkSaving(true);
    setActionMsg("");
    setError("");
    try {
      for (const orderId of selectedOrderIds) {
        await updateOrderRequest(orderId, { status: bulkStatus });
      }
      setActionMsg(`Updated ${selectedOrderIds.length} orders to ${bulkStatus}`);
      await loadOrders(page);
    } catch (err) {
      setError(err.message || "Failed bulk update");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const toCsvCell = (value) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };

  const exportCsv = async () => {
    setIsExporting(true);
    setActionMsg("");
    setError("");
    try {
      const allRows = [];
      let current = 1;
      let lastPage = 1;
      do {
        const { data } = await fetchOrdersPage(current, {}, "100");
        allRows.push(...(Array.isArray(data.items) ? data.items : []));
        lastPage = Number(data.totalPages || 1);
        current += 1;
      } while (current <= lastPage && current <= 100);

      const headers = [
        "Order ID",
        "Created At",
        "Status",
        "User ID",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Item Count",
        "Subtotal",
        "Discount",
        "Shipping",
        "Tax",
        "Grand Total",
        "Carrier",
        "Tracking Number",
      ];

      const lines = [headers.map(toCsvCell).join(",")];
      allRows.forEach((order) => {
        const customer = order.customer || {};
        lines.push(
          [
            order._id,
            order.createdAt,
            order.status,
            order.userId,
            customer.name,
            customer.email,
            customer.phone,
            order.itemCount,
            order.subtotal,
            order.discount,
            order.shipping,
            order.tax,
            order.grandTotal ?? order.total,
            order.carrier,
            order.trackingNumber,
          ]
            .map(toCsvCell)
            .join(",")
        );
      });

      const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setActionMsg(`Exported ${allRows.length} orders to CSV`);
    } catch (err) {
      setError(err.message || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="admin-orders-page-bg">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">{t("Admin - Orders")}</h1>

        <div className="card p-4 mb-5 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input
            className="border p-2 md:col-span-2"
            placeholder="Search by user, carrier, tracking..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="border p-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="total_desc">Total: High to Low</option>
            <option value="total_asc">Total: Low to High</option>
          </select>
          <input
            type="date"
            className="border p-2"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="border p-2"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <div className="md:col-span-6 flex gap-2">
            <button
              className="bg-black text-white px-3 py-2"
              onClick={() => loadOrders(1).catch((err) => setError(err.message || "Failed to fetch orders"))}
            >
              Apply Filters
            </button>
            <button
              className="border px-3 py-2"
              onClick={() => {
                setStatusFilter("");
                setQ("");
                setSortBy("newest");
                setDateFrom("");
                setDateTo("");
                loadOrders(1, {
                  statusFilter: "",
                  q: "",
                  sortBy: "newest",
                  dateFrom: "",
                  dateTo: "",
                }).catch((err) => setError(err.message || "Failed to fetch orders"));
              }}
            >
              Clear
            </button>
            <button
              className="border px-3 py-2"
              disabled={isExporting || loading}
              onClick={exportCsv}
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
            />
            Select all on page
          </label>
          <select
            className="border p-2 text-sm"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            className="bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
            disabled={isBulkSaving || selectedOrderIds.length === 0}
            onClick={applyBulkStatus}
          >
            {isBulkSaving ? "Applying..." : `Apply to ${selectedOrderIds.length} selected`}
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
        {actionMsg && <div className="mb-3 text-sm text-emerald-700">{actionMsg}</div>}

        {loading && <div className="mb-4 text-sm text-gray-600">Loading orders...</div>}

        {orders.map((order) => {
          const draft = draftByOrderId[order._id] || {};
          const customer = order.customer || {};
          const previewItems = Array.isArray(order.items) ? order.items.slice(0, 2) : [];
          const safeDate = order.createdAt ? new Date(order.createdAt) : null;

          return (
            <div key={order._id} className="card p-4 mb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <label className="inline-flex items-center gap-2 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                    />
                    Select
                  </label>
                  <p className="font-semibold">{t("Order ID:")} {order._id}</p>
                  <p className="text-sm text-gray-600">
                    Date: {safeDate && !Number.isNaN(safeDate.getTime()) ? formatDateTime.format(safeDate) : "-"}
                  </p>
                  <p className="text-sm text-gray-600">Items: {order.itemCount || 0}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[order.status] || "bg-slate-100 text-slate-700"}`}
                >
                  {(order.status || "pending").toUpperCase()}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-3">
                  <p className="font-semibold mb-1">Customer</p>
                  <p>Name: {customer.name || "-"}</p>
                  <p>Email: {customer.email || "-"}</p>
                  <p>Phone: {customer.phone || "-"}</p>
                  <p className="text-gray-600 mt-1">User ID: {order.userId || "-"}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-semibold mb-1">Amount</p>
                  <p>Subtotal: {formatCurrency(order.subtotal || 0, lang)}</p>
                  <p>Discount: {formatCurrency(order.discount || 0, lang)}</p>
                  <p>Shipping: {formatCurrency(order.shipping || 0, lang)}</p>
                  <p>Tax: {formatCurrency(order.tax || 0, lang)}</p>
                  <p className="font-semibold">Grand Total: {formatCurrency(order.grandTotal || order.total || 0, lang)}</p>
                </div>
              </div>

              {previewItems.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold mb-1">Items preview</p>
                  <ul className="list-disc pl-5 text-gray-700">
                    {previewItems.map((item, idx) => (
                      <li key={`${order._id}-${idx}`}>
                        {item.productId?.name || "Product"} × {item.qty || 0}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold mb-1">Status timeline</p>
                  <ul className="space-y-1 text-gray-700">
                    {[...order.statusHistory]
                      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
                      .slice(0, 5)
                      .map((entry, idx) => {
                        const at = entry?.at ? new Date(entry.at) : null;
                        const atLabel = at && !Number.isNaN(at.getTime()) ? formatDateTime.format(at) : "-";
                        return (
                          <li key={`${order._id}-history-${idx}`}>
                            <span className="font-medium">{String(entry?.status || "").toUpperCase()}</span>
                            <span className="text-gray-500"> · {atLabel}</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button
                  className="text-sm text-teal-700 underline"
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
                      setError(err.message || "Failed to download invoice");
                    }
                  }}
                >
                  {t("Download Invoice")}
                </button>

                <button
                  className="border px-2 py-1 text-xs"
                  disabled={savingOrderId === order._id}
                  onClick={() => onStatusChange(order._id, "shipped")}
                >
                  Mark Shipped
                </button>
                <button
                  className="border px-2 py-1 text-xs"
                  disabled={savingOrderId === order._id}
                  onClick={() => onStatusChange(order._id, "delivered")}
                >
                  Mark Delivered
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                <select
                  className="border p-2"
                  value={draft.status || order.status || "pending"}
                  disabled={savingOrderId === order._id}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Carrier"
                  className="border px-2 py-2 text-sm"
                  value={draft.carrier ?? ""}
                  disabled={savingOrderId === order._id}
                  onChange={(e) => setDraftField(order._id, "carrier", e.target.value)}
                />
                <input
                  placeholder="Tracking #"
                  className="border px-2 py-2 text-sm"
                  value={draft.trackingNumber ?? ""}
                  disabled={savingOrderId === order._id}
                  onChange={(e) => setDraftField(order._id, "trackingNumber", e.target.value)}
                />
                <button
                  className="bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
                  disabled={savingOrderId === order._id}
                  onClick={() => onSaveShipping(order._id)}
                >
                  {savingOrderId === order._id ? "Saving..." : "Save Shipping"}
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            className="border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => loadOrders(page - 1).catch((err) => setError(err.message || "Failed to fetch orders"))}
          >
            Prev
          </button>
          <div className="text-sm px-2 py-1">Page {page} / {totalPages}</div>
          <div className="text-sm text-gray-600">Total orders: {total}</div>
          <button
            className="border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page >= totalPages || loading}
            onClick={() => loadOrders(page + 1).catch((err) => setError(err.message || "Failed to fetch orders"))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
