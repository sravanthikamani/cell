import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";

export default function Admin() {
  const { user, token } = useAuth();
  const { t, lang } = useI18n();

  if (!user) return <div className="p-10">{t("Loading...")}</div>;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    brand: "",
    group: "",
    type: "",
    images: "",
    stock: "",
    sizes: "",
    colors: "",
  });

  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productSearch, setProductSearch] = useState("");

  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userMsg, setUserMsg] = useState("");

  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minTotal: "",
    maxDiscount: "",
    active: true,
  });

  const groupOptions = ["device", "category"];
  const typeOptions = {
    device: ["smartphones", "tablets", "wearables", "accessories"],
    category: ["audio", "chargers", "cables", "power banks"],
  };

  const loadProducts = async (page = productPage, search = productSearch) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`${API_BASE}/api/admin/products?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to load products");
      return;
    }
    setProducts(Array.isArray(data.items) ? data.items : []);
    setProductPage(data.page || 1);
    setProductTotalPages(data.totalPages || 1);
  };

  const loadUsers = async (
    page = userPage,
    search = userSearch,
    role = userRoleFilter
  ) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("q", search.trim());
    if (role.trim()) params.set("role", role.trim());
    const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setUserMsg(data.error || "Failed to load users");
      return;
    }
    setUsers(Array.isArray(data.items) ? data.items : []);
    setUserPage(data.page || 1);
    setUserTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    loadProducts(1).catch(() => {});
    loadUsers(1).catch(() => {});
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []));
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAnalytics)
      .catch(() => {});
  }, [token]);

  const addProduct = async () => {
    const res = await fetch(`${API_BASE}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images.split(",").map((i) => i.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((i) => i.trim()).filter(Boolean),
        colors: form.colors.split(",").map((i) => i.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to add product");
    alert(t("Product added"));
    await loadProducts(productPage);
  };

  const updateProduct = async () => {
    const res = await fetch(`${API_BASE}/api/admin/products/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images.split(",").map((i) => i.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((i) => i.trim()).filter(Boolean),
        colors: form.colors.split(",").map((i) => i.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to update product");
    alert(t("Product updated"));
    setEditingId(null);
    await loadProducts(productPage);
  };

  const updateUser = async (userId, payload) => {
    setUserMsg("");
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return setUserMsg(data.error || "Failed to update user");
    setUsers((prev) => prev.map((u) => (u._id === userId ? data : u)));
  };

  const deleteUser = async (userId) => {
    setUserMsg("");
    if (!window.confirm("Delete this user?")) return;
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return setUserMsg(data.error || "Failed to delete user");
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-4">{t("Admin - Add Product")}</h1>

      <div className="mb-3 card p-4">
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch(`${API_BASE}/api/admin/upload`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            });
            const data = await res.json();
            if (res.ok && data.url) {
              setForm((f) => ({
                ...f,
                images: f.images ? `${f.images},${data.url}` : data.url,
              }));
            } else {
              alert(data.error || "Upload failed");
            }
          }}
        />
      </div>

      <div className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border p-2" placeholder={t("Name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2" placeholder={t("Price")} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="border p-2" placeholder={t("Brand")} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <select className="border p-2 bg-white" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value, type: "" })}>
          <option value="">Select group</option>
          {groupOptions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="border p-2 bg-white" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!form.group}>
          <option value="">Select type</option>
          {(typeOptions[form.group] || []).map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        <input className="border p-2" placeholder={t("Stock")} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="border p-2 md:col-span-2" placeholder={t("Images (comma URLs)")} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        <input className="border p-2" placeholder={t("Sizes (comma)")} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
        <input className="border p-2" placeholder={t("Colors (comma)")} value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
      </div>

      <button onClick={editingId ? updateProduct : addProduct} className="w-full bg-black text-white py-2 mt-3">
        {editingId ? t("Update Product") : t("Add Product")}
      </button>

      <h2 className="text-xl font-bold mt-10">{t("All Products")}</h2>
      <div className="flex gap-2 mb-3 mt-2">
        <input
          className="border p-2 flex-1"
          placeholder="Search products"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        <button className="bg-black text-white px-3" onClick={() => loadProducts(1)}>
          Search
        </button>
      </div>

      {products.map((p) => (
        <div key={p._id} className="card p-3 mt-2 flex justify-between items-center">
          <div>
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">Stock: {p.stock ?? 0}</div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingId(p._id);
                setForm({
                  name: p.name,
                  price: p.price,
                  brand: p.brand,
                  group: p.group,
                  type: p.type,
                  images: (p.images || []).join(","),
                  stock: p.stock ?? 0,
                  sizes: (p.sizes || []).join(","),
                  colors: (p.colors || []).join(","),
                });
              }}
              className="text-blue-600"
            >
              {t("Edit")}
            </button>
            <button
              onClick={() =>
                fetch(`${API_BASE}/api/admin/products/${p._id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }).then(() => loadProducts(productPage))
              }
              className="text-red-600"
            >
              {t("Delete")}
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-2 mt-3">
        <button className="border px-3 py-1 text-sm disabled:opacity-50" disabled={productPage <= 1} onClick={() => loadProducts(productPage - 1)}>Prev</button>
        <div className="text-sm px-2 py-1">Page {productPage} / {productTotalPages}</div>
        <button className="border px-3 py-1 text-sm disabled:opacity-50" disabled={productPage >= productTotalPages} onClick={() => loadProducts(productPage + 1)}>Next</button>
      </div>

      <h2 className="text-xl font-bold mt-10">{t("Coupons")}</h2>
      <div className="card p-4 mt-3">
        <input className="w-full border p-2 mb-2" placeholder={t("CODE")} value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} />
        <select className="w-full border p-2 mb-2" value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
          <option value="percent">{t("Percent")}</option>
          <option value="fixed">{t("Fixed")}</option>
        </select>
        <input className="w-full border p-2 mb-2" placeholder={t("Value")} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
        <input className="w-full border p-2 mb-2" placeholder={t("Min Total")} value={couponForm.minTotal} onChange={(e) => setCouponForm({ ...couponForm, minTotal: e.target.value })} />
        <input className="w-full border p-2 mb-2" placeholder={t("Max Discount")} value={couponForm.maxDiscount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })} />
        <button
          className="w-full bg-black text-white py-2"
          onClick={async () => {
            const res = await fetch(`${API_BASE}/api/admin/coupons`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                code: couponForm.code,
                type: couponForm.type,
                value: Number(couponForm.value),
                minTotal: Number(couponForm.minTotal || 0),
                maxDiscount: Number(couponForm.maxDiscount || 0),
                active: couponForm.active,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              setCoupons([data, ...coupons]);
              setCouponForm({
                code: "",
                type: "percent",
                value: "",
                minTotal: "",
                maxDiscount: "",
                active: true,
              });
            } else {
              alert(data.error || "Failed to create coupon");
            }
          }}
        >
          {t("Create Coupon")}
        </button>
      </div>

      {coupons.map((c) => (
        <div key={c._id} className="card p-3 mt-2 flex justify-between">
          <div>
            <div className="font-semibold">{c.code}</div>
            <div className="text-sm text-gray-600">{c.type} {c.value} {c.active ? "active" : "inactive"}</div>
          </div>
          <button
            className="text-red-600"
            onClick={async () => {
              await fetch(`${API_BASE}/api/admin/coupons/${c._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              setCoupons(coupons.filter((x) => x._id !== c._id));
            }}
          >
            Delete
          </button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-10">{t("User Management")}</h2>
      <div className="card p-4 mt-3">
        <div className="flex gap-2 mb-3">
          <input className="border p-2 flex-1" placeholder="Search by email/name/phone" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          <select className="border p-2" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
          <button className="bg-black text-white px-3" onClick={() => loadUsers(1)}>Search</button>
        </div>
        {userMsg && <div className="text-sm text-red-600 mb-2">{userMsg}</div>}
        {users.map((u) => (
          <div key={u._id} className="border rounded p-3 mb-2 flex justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">{u.email}</div>
              <div>{u.name || "-"}</div>
              <div>{u.phone || "-"}</div>
              <div>Role: {u.role}</div>
              <div>Status: {u.isBlocked ? "blocked" : "active"}</div>
            </div>
            <div className="flex items-center gap-2">
              <select className="border p-1 text-sm" value={u.role} onChange={(e) => updateUser(u._id, { role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button className="text-sm underline" onClick={() => updateUser(u._id, { isBlocked: !u.isBlocked })}>
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
              <button className="text-sm text-red-600 underline" onClick={() => deleteUser(u._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 mt-3">
          <button className="border px-3 py-1 text-sm disabled:opacity-50" disabled={userPage <= 1} onClick={() => loadUsers(userPage - 1)}>Prev</button>
          <div className="text-sm px-2 py-1">Page {userPage} / {userTotalPages}</div>
          <button className="border px-3 py-1 text-sm disabled:opacity-50" disabled={userPage >= userTotalPages} onClick={() => loadUsers(userPage + 1)}>Next</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-10">{t("Analytics")}</h2>
      {!analytics && <div className="text-sm">{t("Loading analytics...")}</div>}
      {analytics && (
        <div className="card p-4 mt-3">
          <div>{t("Total Orders:")} {analytics.totalOrders}</div>
          <div>{t("Total Sales:")} {formatCurrency(analytics.totalSales, lang)}</div>
          <h3 className="font-semibold mt-3">{t("Top Products")}</h3>
          {analytics.topProducts?.map((p) => (
            <div key={p._id} className="text-sm flex items-center gap-2">
              <span className="w-40 truncate">{p.product?.name || p._id}</span>
              <span>{p.qty} sold</span>
            </div>
          ))}
          <h3 className="font-semibold mt-3">{t("Orders by Day")}</h3>
          {analytics.ordersByDay?.map((d) => (
            <div key={d._id} className="text-sm flex items-center gap-2">
              <span className="w-24">{d._id}</span>
              <span>{d.count} orders</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
