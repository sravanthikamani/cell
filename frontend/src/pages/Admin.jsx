import React, { useCallback, useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { isAdminRole } from "../lib/auth";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import { parseColorImageMapInput, resolveColorSwatch, serializeColorImageMap } from "../lib/colors";
import { BarChart } from "@mui/x-charts/BarChart";
import { useAnimateBarLabel } from "@mui/x-charts/hooks";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

const Text = styled("text")(({ theme }) => ({
  ...theme?.typography?.body2,
  stroke: "none",
  fill: (theme.vars || theme)?.palette?.text?.primary,
}));

function AnimatedBarLabel(props) {
  const {
    seriesId,
    dataIndex,
    color,
    isFaded,
    isHighlighted,
    classes,
    xOrigin,
    yOrigin,
    x,
    y,
    width,
    height,
    layout,
    skipAnimation,
    ...otherProps
  } = props;

  const animatedProps = useAnimateBarLabel({
    xOrigin,
    x,
    yOrigin,
    y,
    width,
    height,
    layout,
    skipAnimation,
  });

  return (
    <Text
      {...otherProps}
      textAnchor="middle"
      dominantBaseline="central"
      {...animatedProps}
    />
  );
}

export default function Admin() {
  const { user, token } = useAuth();
  const { t, lang } = useI18n();
  const sectionWrapClass = "w-full max-w-6xl mx-auto";
  const fieldClass = "border px-2 py-1.5 text-xs h-8";
  const primaryBtnClass = "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm h-10 border border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed";
  const actionBtnClass = "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm h-9 border border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed";
  const iconBtnClass = "inline-flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 transition-colors";
  const compactCouponFieldWidthClass = "w-full md:w-[420px] lg:w-[520px]";
  const compactProductSearchWidthClass = "w-full sm:w-[420px] md:w-[520px] lg:w-[620px] sm:flex-none";
// Feature input state
const [featureName, setFeatureName] = useState("");
const [featureDescription, setFeatureDescription] = useState("");
const [features, setFeatures] = useState([]);
  // state hooks must always be called unconditionally at the top of the component
  const [editingId, setEditingId] = useState(null);
  const [typeWarning, setTypeWarning] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    group: "",
    type: "",
    images: "",
    stock: "",
    sizes: "",
    colors: "",
    colorImageMapInput: "",
    specs: {},
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
  const [userSlideStart, setUserSlideStart] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const userCardsPerView = 6;

  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minTotal: "",
    maxDiscount: "",
    active: true,
  });
  const [offerForm, setOfferForm] = useState({
    title: "Exclusive Special Offer",
    durationValue: 3,
    durationUnit: "days",
    discountType: "percent",
    discountValue: 10,
  });
  const [offerProductIds, setOfferProductIds] = useState([]);
  const [offerSearch, setOfferSearch] = useState("");
  const [offerCategoryFilter, setOfferCategoryFilter] = useState("");
  const [offerDeviceFilter, setOfferDeviceFilter] = useState("");
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [offerMsg, setOfferMsg] = useState("");
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [analyticsChartKey, runAnalyticsAnimation] = React.useReducer((v) => v + 1, 0);
  const topProductsChartRef = useRef(null);
  const ordersByDayChartRef = useRef(null);
  const [topProductsChartWidth, setTopProductsChartWidth] = useState(460);
  const [ordersByDayChartWidth, setOrdersByDayChartWidth] = useState(460);

  const groupOptions = ["device", "category"];
  const productFormRef = useRef(null);
  const productNameInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const typeOptions = {
    device: ["smartphones", "tablets", "wearables", "accessories"],
    category: ["audio", "chargers", "cables", "power banks"],
  };

  const loadProducts = useCallback(async (page = 1, search = "") => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
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
  }, [token]);

  const loadUsers = useCallback(
    async (page = 1, search = "", role = "") => {
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
    },
    [token]
  );

  useEffect(() => {
    // loadProducts and loadUsers trigger state updates; the rule flags the
    // first call, so we disable it explicitly here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts(1).catch(() => {});
    loadUsers(1).catch(() => {});
  }, [token, loadProducts, loadUsers]);

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

  useEffect(() => {
    const observerCleanups = [];

    const bindChartObserver = (ref, setWidth) => {
      const element = ref.current;
      if (!element) return;

      const updateWidth = () => {
        const nextWidth = Math.max(260, Math.min(460, Math.floor(element.clientWidth) - 8));
        setWidth(nextWidth);
      };

      updateWidth();

      if (typeof ResizeObserver !== "undefined") {
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(element);
        observerCleanups.push(() => resizeObserver.disconnect());
      }

      window.addEventListener("resize", updateWidth);
      observerCleanups.push(() => window.removeEventListener("resize", updateWidth));
    };

    bindChartObserver(topProductsChartRef, setTopProductsChartWidth);
    bindChartObserver(ordersByDayChartRef, setOrdersByDayChartWidth);

    return () => {
      observerCleanups.forEach((cleanup) => cleanup());
    };
  }, [analytics]);

  const loadCurrentOffer = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/offers/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setOfferMsg(data.error || "Failed to load current offer");
        return;
      }
      setCurrentOffer(data.offer || null);
      setIsOfferActive(Boolean(data.active));
      if (data.offer) {
        setOfferProductIds((data.offer.productIds || []).map((p) => String(p._id)));
        setOfferForm((prev) => ({
          ...prev,
          title: data.offer.title || prev.title,
          discountType: data.offer.discountType || prev.discountType,
          discountValue: Number(data.offer.discountValue || prev.discountValue),
        }));
      }
    } catch {
      setOfferMsg("Failed to load current offer");
    }
  }, [token]);

  useEffect(() => {
    loadCurrentOffer().catch(() => {});
  }, [loadCurrentOffer]);

  useEffect(() => {
    if (!editingId) return;
    productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => productNameInputRef.current?.focus(), 250);
  }, [editingId]);

  useEffect(() => {
    document.body.classList.add("admin-bg-active");
    return () => {
      document.body.classList.remove("admin-bg-active");
    };
  }, []);

  useEffect(() => {
    setUserSlideStart(0);
    if (!users.length) {
      setSelectedUserId("");
      return;
    }
    setSelectedUserId((prev) => (users.some((u) => u._id === prev) ? prev : users[0]._id));
  }, [users]);

  // early return after declaring all hooks
  if (!user) return <div className="p-10">{t("Loading...")}</div>;
  if (!isAdminRole(user.role)) return <Navigate to="/" replace />;

  const addProduct = async () => {
    // Before API call for product creation
    console.log("FEATURES:", features);
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
        colorImageMap: parseColorImageMapInput(form.colorImageMapInput),
        specs: features.reduce((acc, f) => {
          acc[f.name] = f.description;
          return acc;
        }, {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to add product");
    alert(t("Product added"));
    await loadProducts(productPage, productSearch);
  };

  const updateProduct = async () => {
    // Before API call for product update
    console.log("FEATURES:", features);
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
        colorImageMap: parseColorImageMapInput(form.colorImageMapInput),
        specs: features.reduce((acc, f) => {
          acc[f.name] = f.description;
          return acc;
        }, {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to update product");
    alert(t("Product updated"));
    setEditingId(null);
    await loadProducts(productPage, productSearch);
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

  const submitProductForm = () => (editingId ? updateProduct() : addProduct());

  const resolveProfileImage = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
  };

  const selectedUser = users.find((u) => u._id === selectedUserId) || null;

  const resolveProductImage = (url) => {
    if (!url) return "/images/home-hero.jpeg";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
  };

  const createCoupon = async () => {
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
  };

  const toggleOfferProduct = (productId) => {
    const key = String(productId);
    setOfferProductIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const createSpecialOffer = async () => {
    setOfferMsg("");
    if (!offerProductIds.length) {
      setOfferMsg("Select at least one product for the special offer");
      return;
    }
    setIsSavingOffer(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: offerForm.title,
          productIds: offerProductIds,
          durationValue: Number(offerForm.durationValue || 3),
          durationUnit: offerForm.durationUnit,
          discountType: offerForm.discountType,
          discountValue: Number(offerForm.discountValue || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOfferMsg(data.error || "Failed to create special offer");
        return;
      }
      setOfferMsg("Special offer saved");
      setCurrentOffer(data.offer || null);
      setIsOfferActive(true);
      await loadCurrentOffer();
    } catch {
      setOfferMsg("Failed to create special offer");
    } finally {
      setIsSavingOffer(false);
    }
  };

  const disableCurrentOffer = async () => {
    if (!currentOffer?._id) return;
    setOfferMsg("");
    setIsSavingOffer(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/offers/${currentOffer._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setOfferMsg(data.error || "Failed to disable offer");
        return;
      }
      setOfferMsg("Offer disabled");
      setCurrentOffer(null);
      setIsOfferActive(false);
    } catch {
      setOfferMsg("Failed to disable offer");
    } finally {
      setIsSavingOffer(false);
    }
  };

  const topProducts = Array.isArray(analytics?.topProducts) ? analytics.topProducts : [];
  const ordersByDay = Array.isArray(analytics?.ordersByDay) ? analytics.ordersByDay : [];
  const topProductLabels = topProducts.map((p) => p.product?.name || p._id || "-");
  const topProductQtyData = topProducts.map((p) => Number(p.qty || 0));
  const ordersByDayLabels = ordersByDay.map((d) => d._id || "-");
  const ordersByDayCountData = ordersByDay.map((d) => Number(d.count || 0));
  const normalizedOfferSearch = offerSearch.trim().toLowerCase();
  const hasOfferTypeFilter = Boolean(offerCategoryFilter || offerDeviceFilter);
  const offerProducts = products.filter((p) => {
    const textMatched = !normalizedOfferSearch
      || [p.name, p.brand, p.type, p.group].some((field) =>
        String(field || "").toLowerCase().includes(normalizedOfferSearch)
      );

    if (!textMatched) return false;
    if (!hasOfferTypeFilter) return true;

    const isCategoryMatch = Boolean(
      offerCategoryFilter && p.group === "category" && p.type === offerCategoryFilter
    );
    const isDeviceMatch = Boolean(
      offerDeviceFilter && p.group === "device" && p.type === offerDeviceFilter
    );

    return isCategoryMatch || isDeviceMatch;
  });
  const parsedColorNames = String(form.colors || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="admin-page-bg min-h-screen flex flex-col">
      <div className="flex-1 w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-4 text-center text-[#000080]">{t("Admin - Add Product")}</h1>

      <div className="grid grid-cols-1 gap-6 items-start">
      <div>

      <div
        ref={productFormRef}
        className="card p-4 w-full h-full"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitProductForm();
          }
        }}
      >
        <h2 className="text-lg font-bold text-center mb-3 text-[#000080]">Add new products</h2>

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
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
            e.target.value = "";
          }}
        />
        <div className="mb-3 flex justify-center">
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            Upload image
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input ref={productNameInputRef} className={fieldClass} placeholder={t("Name")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className={fieldClass} placeholder={t("Product Description")} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className={fieldClass} placeholder={t("Price (EUR)")} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className={fieldClass} placeholder={t("Brand")} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          <select className={`${fieldClass} bg-white`} value={form.group} onChange={e => {
            setForm({ ...form, group: e.target.value, type: "" });
            setTypeWarning("");
          }}>
            <option value="">Select group</option>
            {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            className={`${fieldClass} bg-white`}
            value={form.type}
            onMouseDown={() => {
              if (!form.group) setTypeWarning("first select group");
            }}
            onFocus={() => {
              if (!form.group) setTypeWarning("first select group");
            }}
            onChange={e => {
              if (!form.group) {
                setTypeWarning("first select group");
                return;
              }
              setTypeWarning("");
              setForm({ ...form, type: e.target.value });
            }}
          >
            <option value="">Select type</option>
            {(typeOptions[form.group] || []).map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
          {typeWarning && <p className="md:col-span-2 text-sm text-red-600">{typeWarning}</p>}
          <input className={fieldClass} placeholder={t("Stock")} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <input className={`${fieldClass} md:col-span-2`} placeholder={t("Images (comma URLs)")} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
          <input className={fieldClass} placeholder={t("Colors (comma)")} value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} />
          <input className={`${fieldClass} md:col-span-2`} placeholder="Color Images (name:url, name:url)" value={form.colorImageMapInput} onChange={e => setForm({ ...form, colorImageMapInput: e.target.value })} />
          <input className={fieldClass} placeholder="Feature Name" value={featureName} onChange={e => setFeatureName(e.target.value)} />
          <input className={fieldClass} placeholder="Feature Description" value={featureDescription} onChange={e => setFeatureDescription(e.target.value)} />
          <button type="button" className={`w-full sm:w-auto sm:min-w-[160px] sm:mx-auto block mt-3 ${primaryBtnClass}`} onClick={() => {
            if (!featureName.trim() || !featureDescription.trim()) return;
            setFeatures(f => [...f, { name: featureName.trim(), description: featureDescription.trim() }]);
            setFeatureName("");
            setFeatureDescription("");
          }}>Add Feature</button>
          {features.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-sm mb-1">Features:</h4>
              <ul className="list-disc pl-5">
                {features.map((f, idx) => (
                  <li key={idx} className="mb-1">
                    <span className="font-bold">{f.name}:</span> {f.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button type="button" onClick={submitProductForm} className={`w-full sm:w-auto sm:min-w-[160px] sm:mx-auto block mt-3 ${primaryBtnClass}`}>
          {editingId ? t("Update Product") : t("Add Product")}
        </button>
      </div>
      </div>

      <div>
      <div
        className="card p-4 mt-3 w-full max-w-[600px] mx-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            createCoupon();
          }
        }}
      >
        <h2 className="text-xl font-bold mt-1 xl:mt-0 text-center mb-3 text-[#000080]">{t("Coupons")}</h2>
        <input className={`mb-2 ${fieldClass} ${compactCouponFieldWidthClass}`} placeholder={t("CODE")} value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} />
        <select className={`mb-2 ${fieldClass} ${compactCouponFieldWidthClass}`} value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
          <option value="percent">{t("Percent")}</option>
          <option value="fixed">{t("Fixed")}</option>
        </select>
        <input className={`mb-2 ${fieldClass} ${compactCouponFieldWidthClass}`} placeholder={t("Value")} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
        <input className={`mb-2 ${fieldClass} ${compactCouponFieldWidthClass}`} placeholder={t("Min Total")} value={couponForm.minTotal} onChange={(e) => setCouponForm({ ...couponForm, minTotal: e.target.value })} />
        <input className={`mb-2 ${fieldClass} ${compactCouponFieldWidthClass}`} placeholder={t("Max Discount")} value={couponForm.maxDiscount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })} />
        <button type="button" className={`w-auto min-w-[160px] ${primaryBtnClass}`} onClick={createCoupon}>
          {t("Create Coupon")}
        </button>
        <div className="mt-3 space-y-2">
          {coupons.map((c) => (
            <div key={c._id} className="card p-3 flex justify-between w-full max-w-[300px] mx-auto">
              <div>
                <div className="font-semibold">{c.code}</div>
                <div className="text-sm text-gray-600">{c.type} {c.value} {c.active ? "active" : "inactive"}</div>
              </div>
              <button
                type="button"
                title={t("Delete")}
                aria-label={t("Delete")}
                className={`${iconBtnClass} text-red-500 hover:text-red-700`}
                onClick={async () => {
                  await fetch(`${API_BASE}/api/admin/coupons/${c._id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setCoupons(coupons.filter((x) => x._id !== c._id));
                }}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-10 rounded-xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold mb-2 text-center text-[#000080]">{t("All Products")}</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className={`${fieldClass} w-full`}
              placeholder="Search products"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  loadProducts(1);
                }
              }}
            />
            <button type="button" className={`${primaryBtnClass} w-full sm:w-auto sm:flex-none`} onClick={() => loadProducts(1)}>
              Search
            </button>
          </div>
        </div>

      {products.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Image</th>
                  <th className="text-left px-3 py-2 font-semibold">Name</th>
                  <th className="text-left px-3 py-2 font-semibold">Brand</th>
                  <th className="text-left px-3 py-2 font-semibold">Price</th>
                  <th className="text-left px-3 py-2 font-semibold">Stock</th>
                  <th className="text-left px-3 py-2 font-semibold">Colors</th>
                  <th className="text-center px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-slate-200 hover:bg-slate-50/70">
                    <td className="px-3 py-2">
                      <img
                        src={resolveProductImage(p.images?.[0])}
                        alt={p.name}
                        className="h-12 w-12 rounded object-cover border border-slate-200"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800 max-w-[220px] truncate">{p.name}</td>
                    <td className="px-3 py-2 text-slate-600">{p.brand}</td>
                    <td className="px-3 py-2 text-blue-700 font-semibold">{formatCurrency(p.price, lang)}</td>
                    <td className="px-3 py-2 text-slate-600">{p.stock ?? 0}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.colors || []).slice(0, 4).map((c, idx) => (
                          <span key={`${p._id}-${c}-${idx}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] bg-white">
                            <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-300" style={{ backgroundColor: resolveColorSwatch(c) }} />
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title={t("Edit")}
                          aria-label={t("Edit")}
                          onClick={() => {
                            setEditingId(p._id);
                            setForm({
                              name: p.name,
                              description: p.description || "",
                              price: p.price,
                              brand: p.brand,
                              group: p.group,
                              type: p.type,
                              display: p.display || "",
                              processor: p.processor || "",
                              ram: p.ram || "",
                              storage: p.storage || "",
                              camera: p.camera || "",
                              battery: p.battery || "",
                              os: p.os || "",
                              images: (p.images || []).join(","),
                              stock: p.stock ?? 0,
                              sizes: (p.sizes || []).join(","),
                              colors: (p.colors || []).join(","),
                              colorImageMapInput: serializeColorImageMap(p.colorImageMap || {}),
                            });
                          }}
                          className={iconBtnClass}
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title={t("Delete")}
                          aria-label={t("Delete")}
                          onClick={() =>
                            fetch(`${API_BASE}/api/admin/products/${p._id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }).then(() => loadProducts(productPage, productSearch))
                          }
                          className={`${iconBtnClass} text-red-500 hover:text-red-700`}
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-200 bg-slate-50">
            <button className={actionBtnClass} disabled={productPage <= 1} onClick={() => loadProducts(productPage - 1, productSearch)}>
              Prev
            </button>
            <div className="text-sm text-slate-700">Page {productPage} / {productTotalPages}</div>
            <button className={actionBtnClass} disabled={productPage >= productTotalPages} onClick={() => loadProducts(productPage + 1, productSearch)}>
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="px-4 py-4 text-sm text-gray-600">No products found.</div>
      )}
      </div>

      <div className={`card p-4 mt-3 ${sectionWrapClass}`}>
        <h2 className="text-xl font-bold text-center mb-3 text-[#000080]">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className={fieldClass}
            placeholder="Offer title"
            value={offerForm.title}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className={fieldClass}
            type="number"
            min="1"
            placeholder="Duration"
            value={offerForm.durationValue}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, durationValue: e.target.value }))}
          />
          <select
            className={`${fieldClass} bg-white`}
            value={offerForm.durationUnit}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, durationUnit: e.target.value }))}
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="nights">nights</option>
            <option value="months">months</option>
          </select>
          <select
            className={`${fieldClass} bg-white`}
            value={offerForm.discountType}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, discountType: e.target.value }))}
          >
            <option value="percent">percent off (%)</option>
            <option value="fixed">fixed off (€)</option>
          </select>
          <input
            className={fieldClass}
            type="number"
            min="0.01"
            step="0.01"
            placeholder={offerForm.discountType === "percent" ? "Discount %" : "Discount value"}
            value={offerForm.discountValue}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, discountValue: e.target.value }))}
          />
        </div>

        <div className="text-xs text-gray-600 mt-2">
          Tip: Set <strong>3 days</strong> to run a limited offer and auto-return to the present offers page after expiry.
        </div>

        <div className="mt-3 border rounded p-3 max-h-56 overflow-auto bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <input
              className={fieldClass}
              placeholder="Search offer products"
              value={offerSearch}
              onChange={(e) => setOfferSearch(e.target.value)}
            />
            <select
              className={`${fieldClass} bg-white`}
              value={offerCategoryFilter}
              onChange={(e) => setOfferCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {typeOptions.category.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className={`${fieldClass} bg-white`}
              value={offerDeviceFilter}
              onChange={(e) => setOfferDeviceFilter(e.target.value)}
            >
              <option value="">All devices</option>
              {typeOptions.device.map((device) => (
                <option key={device} value={device}>{device}</option>
              ))}
            </select>
          </div>
          <div className="text-sm font-semibold mb-2">Select products for this offer</div>
          {offerProducts.length === 0 ? (
            <div className="text-sm text-gray-600">
              {products.length === 0
                ? "Load/search products first, then select them here."
                : "No products match the selected search/filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {offerProducts.map((p) => {
                const checked = offerProductIds.includes(String(p._id));
                return (
                  <label key={p._id} className="border rounded px-2 py-2 text-sm flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOfferProduct(p._id)}
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${primaryBtnClass} w-[190px] justify-center`}
            onClick={createSpecialOffer}
            disabled={isSavingOffer}
          >
            {isSavingOffer ? "Saving..." : "Save Special Offer"}
          </button>
          <button
            type="button"
            className={`${primaryBtnClass} w-[190px] justify-center bg-slate-500 border-slate-500 hover:bg-slate-600 disabled:bg-slate-400 disabled:border-slate-400`}
            onClick={disableCurrentOffer}
            disabled={isSavingOffer || !currentOffer?._id}
          >
            Disable Current Offer
          </button>
        </div>

        {offerMsg && <div className="text-sm mt-2 text-blue-700">{offerMsg}</div>}

        <div className="text-sm mt-3">
          {currentOffer ? (
            <>
              <div>
                <strong>Current offer:</strong> {currentOffer.title || "Exclusive Special Offer"}
              </div>
              <div>
                <strong>Status:</strong> {isOfferActive ? "Active" : "Scheduled"}
              </div>
              <div>
                <strong>Window:</strong> {new Date(currentOffer.startsAt).toLocaleString()} - {new Date(currentOffer.endsAt).toLocaleString()}
              </div>
              <div>
                <strong>Products:</strong> {(currentOffer.productIds || []).length}
              </div>
              <div>
                <strong>Discount:</strong> {currentOffer.discountType === "percent"
                  ? `${Number(currentOffer.discountValue || 0)}% off`
                  : `€${Number(currentOffer.discountValue || 0)} off`}
              </div>
            </>
          ) : (
            <div className="text-gray-600">No active/scheduled special offer. Default offers page will be shown to users.</div>
          )}
        </div>
      </div>

      <div className={`card p-4 mt-3 ${sectionWrapClass}`}>
        <h2 className="text-xl font-bold text-center mb-3 text-[#000080]">{t("User Management")}</h2>
        <div className="flex gap-2 mb-3">
          <input
            className={`${fieldClass} w-full md:w-[380px] lg:w-[460px]`}
            placeholder="Search by email/name/phone"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                loadUsers(1);
              }
            }}
          />
          <select className={fieldClass} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
          <button type="button" className={primaryBtnClass} onClick={() => loadUsers(1)}>Search</button>
        </div>
        {userMsg && <div className="text-sm text-red-600 mb-2">{userMsg}</div>}

        {users.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className={actionBtnClass}
              disabled={userSlideStart <= 0}
              onClick={() => setUserSlideStart((s) => Math.max(0, s - 1))}
            >
              ←
            </button>
            <div className="text-xs text-gray-600">
              Showing {Math.min(users.length, userSlideStart + 1)}-
              {Math.min(users.length, userSlideStart + userCardsPerView)} of {users.length}
            </div>
            <button
              type="button"
              className={actionBtnClass}
              disabled={userSlideStart + userCardsPerView >= users.length}
              onClick={() =>
                setUserSlideStart((s) => Math.min(Math.max(0, users.length - userCardsPerView), s + 1))
              }
            >
              →
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {users.slice(userSlideStart, userSlideStart + userCardsPerView).map((u) => (
            <button
              key={u._id}
              type="button"
              className={`w-full flex items-center justify-center rounded-full border-2 aspect-square overflow-hidden bg-blue-600 text-white ${selectedUserId === u._id ? "border-blue-800" : "border-blue-600"}`}
              onClick={() => setSelectedUserId(u._id)}
              title={u.name || u.email}
            >
              {u.profileImage ? (
                <img
                  src={resolveProfileImage(u.profileImage)}
                  alt={u.name || u.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-slate-700">
                  {String(u.name || u.email || "U").trim().charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </div>

        {selectedUser && (
          <div className="border rounded p-3 mt-3 flex justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">{selectedUser.email}</div>
              <div>{selectedUser.name || "-"}</div>
              <div>{selectedUser.phone || "-"}</div>
              <div>Role: {selectedUser.role}</div>
              <div>Status: {selectedUser.isBlocked ? "blocked" : "active"}</div>
            </div>
            <div className="flex items-center gap-2">
              <select className={fieldClass} value={selectedUser.role} onChange={(e) => updateUser(selectedUser._id, { role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button className={actionBtnClass} onClick={() => updateUser(selectedUser._id, { isBlocked: !selectedUser.isBlocked })}>
                {selectedUser.isBlocked ? "Unblock" : "Block"}
              </button>
              <button
                type="button"
                title={t("Delete")}
                aria-label={t("Delete")}
                className={`${iconBtnClass} text-red-500 hover:text-red-700`}
                onClick={() => deleteUser(selectedUser._id)}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {users.length === 0 && <div className="text-sm text-gray-600">No users found.</div>}

        <div className="flex gap-2 mt-3">
          <button className={actionBtnClass} disabled={userPage <= 1} onClick={() => loadUsers(userPage - 1)}>Prev</button>
          <div className="text-sm px-2 py-1">Page {userPage} / {userTotalPages}</div>
          <button className={actionBtnClass} disabled={userPage >= userTotalPages} onClick={() => loadUsers(userPage + 1)}>Next</button>
        </div>
      </div>

      {!analytics && <div className="text-sm">{t("Loading analytics...")}</div>}
      {analytics && (
        <div className={`card p-4 mt-3 ${sectionWrapClass}`}>
          <h2 className="text-xl font-bold text-center mb-3 text-[#000080]">{t("Analytics")}</h2>
          <div>{t("Total Orders:")} {analytics.totalOrders}</div>
          <div>{t("Total Sales:")} {formatCurrency(analytics.totalSales, lang)}</div>
          <Stack spacing={2} className="mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div ref={topProductsChartRef} className="w-full min-w-0 overflow-hidden">
                <h3 className="font-semibold mb-2 text-[#000080]">{t("Top Products")}</h3>
                {topProducts.length === 0 ? (
                  <div className="text-sm text-gray-500">No data</div>
                ) : (
                  <BarChart
                    key={`products-${analyticsChartKey}`}
                    xAxis={[{ data: topProductLabels, scaleType: "band" }]}
                    series={[
                      {
                        type: "bar",
                        label: "Sold",
                        data: topProductQtyData,
                      },
                    ]}
                    width={topProductsChartWidth}
                    height={320}
                    barLabel="value"
                    slots={{ barLabel: AnimatedBarLabel }}
                  />
                )}
              </div>

              <div ref={ordersByDayChartRef} className="w-full min-w-0 overflow-hidden">
                <h3 className="font-semibold mb-2 text-[#000080]">{t("Orders by Day")}</h3>
                {ordersByDay.length === 0 ? (
                  <div className="text-sm text-gray-500">No data</div>
                ) : (
                  <BarChart
                    key={`days-${analyticsChartKey}`}
                    xAxis={[{ data: ordersByDayLabels, scaleType: "band" }]}
                    series={[
                      {
                        type: "bar",
                        label: "Orders",
                        data: ordersByDayCountData,
                      },
                    ]}
                    width={ordersByDayChartWidth}
                    height={320}
                    barLabel="value"
                    slots={{ barLabel: AnimatedBarLabel }}
                  />
                )}
              </div>
            </div>

            <button type="button" className={`${primaryBtnClass} w-[250px] mx-auto block`} onClick={() => runAnalyticsAnimation()}>
              Run Animation
            </button>
          </Stack>
        </div>
      )}
      </div>
      {/* <Footer /> */}
    </div>
  );
}


