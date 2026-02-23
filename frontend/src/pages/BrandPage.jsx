import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";

export default function BrandPage() {
  const { group, type, brand } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { user, token } = useAuth();
  const { t, lang } = useI18n();
  const normalizeSegment = (value = "") =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    ram: "",
    storage: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then(res => res.json())
      .then(data => {
        const findKey = (obj, key) =>
          Object.keys(obj || {}).find(
            (k) => normalizeSegment(k) === normalizeSegment(key)
          );
        const groupKey = findKey(data, group);
        const typeKey = findKey(data?.[groupKey], type);
        const brandKey = findKey(data?.[groupKey]?.[typeKey], brand);
        const list = data?.[groupKey]?.[typeKey]?.[brandKey] || [];
        setProducts(list);
      });
  }, [group, type, brand]);

  const filtered = products.filter(p => {
    return (
      (!filters.ram || p.ram === filters.ram) &&
      (!filters.storage || p.storage === filters.storage) &&
      (!filters.maxPrice || p.price <= filters.maxPrice)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-10">
      <Seo
        title={`${brand} ${t(type)}`}
        description={`Browse ${brand} ${t(type)} products with filters and pricing.`}
        canonicalPath={`/${normalizeSegment(group)}/${normalizeSegment(type)}/${normalizeSegment(brand)}`}
      />

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {brand} {type}
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <select
          className="border p-2"
          onChange={e => setFilters(f => ({ ...f, ram: e.target.value }))}
        >
          <option value="">{t("RAM")}</option>
          <option>8GB</option>
          <option>12GB</option>
        </select>

        <select
          className="border p-2"
          onChange={e => setFilters(f => ({ ...f, storage: e.target.value }))}
        >
          <option value="">{t("Storage")}</option>
          <option>128GB</option>
          <option>256GB</option>
        </select>

        <input
          type="number"
          placeholder={t("Max Price")}
          className="border p-2"
          onChange={e =>
            setFilters(f => ({ ...f, maxPrice: e.target.value }))
          }
        />
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div
            key={product._id}
            className="border rounded-lg p-4 hover:shadow-lg"
          >
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-gray-600">
              {formatCurrency(product.price, lang)}
            </p>
            <p className="text-sm">
              {product.ram} | {product.storage}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/product/${product._id}`)}
                className="border px-4 py-1"
              >
                {t("View")}
              </button>

              <button
                onClick={async () => {
                  if (!user) return alert(t("Login first"));
                  await fetch(`${API_BASE}/api/cart/add`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      productId: product._id,
                    }),
                  });
                  await refreshCart();
                }}
                className="bg-teal-600 text-white px-4 py-1"
              >
                {t("Add to Cart")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
