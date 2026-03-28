import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";
import { ArrowDownUp, ShoppingCart, SlidersHorizontal } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [group, setGroup] = useState("");
  const [type, setType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState({
    groups: [],
    types: [],
    brands: [],
  });
  const [catalogTree, setCatalogTree] = useState({});
  const hasSearchQuery = Boolean(q.trim());
  const hasActiveFilters = Boolean(
    q || brand || group || type || priceMin || priceMax || sortBy !== "newest"
  );
  const activeFilterCount = [
    q,
    brand,
    group,
    type,
    priceMin,
    priceMax,
    sortBy !== "newest" ? "sort" : "",
  ].filter(Boolean).length;
  const filterControlClass = "h-10 w-full rounded-lg border border-slate-300/90 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const filterButtonClass = "h-10 w-full rounded-lg border border-slate-300/90 bg-slate-100 px-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-200 hover:border-slate-400";
  const productsBg =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772628644/nordwood-themes-R53t-Tg6J4c-unsplash_um5hxv.jpg";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get("q") || "");
  }, [location.search]);

  // 🔹 Load products with search + filters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (brand) params.set("brand", brand);
      if (group) params.set("group", group);
      if (type) params.set("type", type);
      if (priceMin) params.set("priceMin", priceMin);
      if (priceMax) params.set("priceMax", priceMax);
      if (sortBy) params.set("sort", sortBy);

      const url = `${API_BASE}/api/products/search?${params.toString()}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(console.error);
    }, 300);

    return () => clearTimeout(timer);
  }, [q, brand, group, type, priceMin, priceMax, sortBy]);

  // 🔹 Load filter options from catalog
  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        setCatalogTree(data || {});
        const groups = Object.keys(data || {});
        const typesSet = new Set();
        const brandsSet = new Set();

        Object.values(data || {}).forEach((groupObj) => {
          Object.keys(groupObj || {}).forEach((typeKey) => {
            typesSet.add(typeKey);
            Object.keys(groupObj[typeKey] || {}).forEach((brandKey) => {
              brandsSet.add(brandKey);
            });
          });
        });

        setCatalogOptions({
          groups,
          types: Array.from(typesSet),
          brands: Array.from(brandsSet),
        });
      })
      .catch(console.error);
  }, []);

  const getTypeOptions = () => {
    if (!group) return catalogOptions.types;
    const groupObj = catalogTree[group] || {};
    return Object.keys(groupObj);
  };

  const getBrandOptions = () => {
    if (!group && !type) return catalogOptions.brands;
    const brandsSet = new Set();
    if (group) {
      const groupObj = catalogTree[group] || {};
      if (type) {
        Object.keys(groupObj[type] || {}).forEach((b) =>
          brandsSet.add(b)
        );
      } else {
        Object.values(groupObj).forEach((typeObj) => {
          Object.keys(typeObj || {}).forEach((b) => brandsSet.add(b));
        });
      }
    } else {
      Object.values(catalogTree).forEach((groupObj) => {
        const typeObj = groupObj[type] || {};
        Object.keys(typeObj || {}).forEach((b) => brandsSet.add(b));
      });
    }
    return Array.from(brandsSet);
  };

  // Auto-clear invalid selections when options change
  useEffect(() => {
    const validTypes = new Set(getTypeOptions());
    if (type && !validTypes.has(type)) setType("");
  }, [group]);

  useEffect(() => {
    const validBrands = new Set(getBrandOptions());
    if (brand && !validBrands.has(brand)) setBrand("");
  }, [group, type]);

  // 🔹 Add to cart
  const addToCart = async (productId) => {
    if (!user) {
      alert(t("Login first"));
      return;
    }

    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id || user._id,
        productId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || t("Failed to add to cart"));
      return;
    }

    await refreshCart();
    window.location.reload();
  };

  const clearFilters = () => {
    setQ("");
    setBrand("");
    setGroup("");
    setType("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("newest");
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${productsBg})` }}
    >
      <div className="w-full h-full p-6 md:p-10">
      <Seo
        title={hasSearchQuery ? `Search: ${q.trim()}` : "Products"}
        description={
          hasSearchQuery
            ? `Search results for ${q.trim()} at HI-TECH.`
            : "Browse all electronics products with filters for brand, group, type, price, and popularity."
        }
        canonicalPath="/products"
        noindex={hasSearchQuery}
        keywords="products, electronics catalog, smartphones, accessories"
      />

      <h1 className="text-3xl font-bold mb-6">{t("Products")}</h1>

      <div className="md:hidden sticky top-24 z-20 mb-3">
        <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-2 py-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`${filterButtonClass} h-9 inline-flex items-center justify-center gap-1.5 ${hasActiveFilters ? "border-blue-400 text-blue-700" : ""}`}
              onClick={() => setIsMobileFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal size={14} />
              <span>{isMobileFiltersOpen ? "Hide Filters" : "Filters"}</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative">
              <ArrowDownUp
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <select
                className={`${filterControlClass} h-9 pl-8`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">{t("Newest")}</option>
                <option value="price_asc">{t("Price: Low to High")}</option>
                <option value="popularity">{t("Popularity")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={`card p-3 md:p-5 mb-8 animate-fade-up ${isMobileFiltersOpen ? "block" : "hidden"} md:block`}>
        <div className="grid grid-cols-2 gap-2.5 md:hidden">
          <input
            className={`${filterControlClass} col-span-2`}
            placeholder={t("Search by name or brand...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className={filterControlClass}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">{t("All Brands")}</option>
            {getBrandOptions().map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            className={filterControlClass}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">{t("All Groups")}</option>
            {catalogOptions.groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className={filterControlClass}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">{t("All Types")}</option>
            {getTypeOptions().map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            className={filterControlClass}
            placeholder={t("Min €")}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />

          <input
            className={filterControlClass}
            placeholder={t("Max €")}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />

          <button className={`${filterButtonClass} col-span-2`} onClick={clearFilters}>{t("Clear Filters")}</button>
        </div>

        <div className="hidden md:grid md:grid-cols-12 gap-3">
          <input
            className={`${filterControlClass} md:col-span-4`}
            placeholder={t("Search by name or brand...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className={`${filterControlClass} md:col-span-2`}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">{t("All Brands")}</option>
            {getBrandOptions().map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            className={`${filterControlClass} md:col-span-2`}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">{t("All Groups")}</option>
            {catalogOptions.groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className={`${filterControlClass} md:col-span-2`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">{t("All Types")}</option>
            {getTypeOptions().map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="relative md:col-span-2">
            <ArrowDownUp
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <select
              className={`${filterControlClass} pl-8`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t("Newest")}</option>
              <option value="price_asc">{t("Price: Low to High")}</option>
              <option value="popularity">{t("Popularity")}</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-center gap-2 rounded-lg border border-slate-300/90 bg-white px-2 h-10 shadow-sm">
            <span className="inline-flex items-center justify-center rounded bg-slate-100 text-slate-600 text-xs font-semibold px-2 h-6">€</span>
            <input
              className="w-full min-w-0 border-0 p-0 text-sm text-slate-700 outline-none focus:ring-0"
              placeholder={t("Min €")}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <span className="h-5 w-px bg-slate-300" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{t("to")}</span>
            <span className="inline-flex items-center justify-center rounded bg-slate-100 text-slate-600 text-xs font-semibold px-2 h-6">€</span>
            <input
              className="w-full min-w-0 border-0 p-0 text-sm text-slate-700 outline-none focus:ring-0"
              placeholder={t("Max €")}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          <button className={`${filterButtonClass} md:col-span-2 md:ml-auto`} onClick={clearFilters}>{t("Clear Filters")}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="card p-4 animate-fade-in">

            {/* 🔗 GO TO PRODUCT PAGE */}
            <Link to={`/product/${p._id}`}>
              <img
                src={
                  p.images?.[0]?.startsWith("/uploads")
                    ? `${API_BASE}${p.images?.[0]}`
                    : p.images?.[0]
                }
                alt={p.name}
                className="h-44 w-full object-cover rounded-xl cursor-pointer"
              />
              <h2 className="font-bold mt-2">{p.name}</h2>
            </Link>

            <p className="mt-1">{formatCurrency(p.price, lang)}</p>
            <p className="mt-1 text-sm text-gray-600">
              {p.stock > 0
                ? t("Stock: {count}", { count: p.stock })
                : t("Out of stock")}
            </p>

            <button
              onClick={() => addToCart(p._id)}
              className="mt-3 inline-flex items-center justify-center rounded-full p-2 btn-primary disabled:opacity-50"
              disabled={p.stock <= 0}
              aria-label={t("Add to Cart")}
              title={t("Add to Cart")}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
