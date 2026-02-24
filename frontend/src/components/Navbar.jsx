import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  ShoppingBag,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

const DEFAULT_MENU_DATA = {
  device: [
    { label: "Smartphones", icon: "" },
    { label: "Tablets", icon: "" },
    { label: "Wearables", icon: "" },
    { label: "Accessories", icon: "" },
  ],
  category: [
    { label: "Audio", icon: "" },
    { label: "Chargers", icon: "" },
    { label: "Cables", icon: "" },
    { label: "Power Banks", icon: "" },
  ],
  faq: [
    { label: "Shipping", icon: "" },
    { label: "Product", icon: "" },
    { label: "Warranty", icon: "" },
    { label: "General", icon: "" },
  ],
};

const sanitizeMenuSection = (value, fallback) => {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item) => item && typeof item.label === "string" && item.label.trim())
    .map((item) => ({
      label: item.label.trim(),
      icon: typeof item.icon === "string" ? item.icon : "",
    }));
};

const normalizeMenuPayload = (payload) => ({
  device: sanitizeMenuSection(payload?.device, DEFAULT_MENU_DATA.device),
  category: sanitizeMenuSection(payload?.category, DEFAULT_MENU_DATA.category),
  faq: sanitizeMenuSection(payload?.faq, DEFAULT_MENU_DATA.faq),
});

export default function Navbar() {
  const { cartCount } = useCart();
  const { dark, setDark } = useTheme();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [wishlistCount, setWishlistCount] = useState(0);

  const [menuData, setMenuData] = useState(DEFAULT_MENU_DATA);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [topIndex, setTopIndex] = useState(0);

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [productResults, setProductResults] = useState([]);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const toSlug = (value = "") =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    fetch(`${API_BASE}/api/menu`)
      .then((res) => res.json())
      .then((data) => setMenuData(normalizeMenuPayload(data)))
      .catch(() => {
        setMenuData(DEFAULT_MENU_DATA);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    const load = () => {
      fetch(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => setWishlistCount((data.products || []).length))
        .catch(() => setWishlistCount(0));
    };
    load();
    const handler = () => load();
    window.addEventListener("wishlist:changed", handler);
    return () => window.removeEventListener("wishlist:changed", handler);
  }, [user]);

  useEffect(() => {
    const handler = () => {
      setOpenDropdown((prev) => (prev ? null : prev));
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setGlobalSearchOpen((prev) => (prev ? false : prev));
      setGlobalSearch((prev) => (prev ? "" : prev));
      setProductResults((prev) => (prev.length ? [] : prev));
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      setOpenDropdown(null);
      setGlobalSearchOpen(false);
      setGlobalSearch("");
      setProductResults([]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopIndex((i) => (i + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const term = globalSearch.trim();
    if (!globalSearchOpen || term.length < 2) {
      setProductResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) =>
          setProductResults(Array.isArray(data) ? data.slice(0, 6) : [])
        )
        .catch(() => setProductResults([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [globalSearch, globalSearchOpen]);

  useEffect(() => {
    if (!globalSearchOpen) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [globalSearchOpen]);

  const quickLinks = useMemo(() => {
    const links = [
      {
        key: "home",
        label: t("HOME"),
        path: "/",
        icon: "",
        searchIndex: "home",
      },
      {
        key: "products",
        label: t("PRODUCTS"),
        path: "/products",
        icon: "",
        searchIndex: "products product catalog shop",
      },
      {
        key: "about",
        label: t("ABOUT US"),
        path: "/about",
        icon: "",
        searchIndex: "about us company",
      },
      {
        key: "warranty",
        label: t("WARRANTY"),
        path: "/warranty",
        icon: "",
        searchIndex: "warranty support",
      },
    ];

    if (user) {
      links.push(
        {
          key: "orders",
          label: t("MY ORDERS"),
          path: "/orders",
          icon: "",
          searchIndex: "orders my orders history",
        },
        {
          key: "profile",
          label: t("PROFILE"),
          path: "/profile",
          icon: "",
          searchIndex: "profile account",
        },
        {
          key: "wishlist",
          label: t("WISHLIST"),
          path: "/wishlist",
          icon: "",
          searchIndex: "wishlist favorites",
        }
      );
    }

    if (user?.role === "admin") {
      links.push(
        {
          key: "admin",
          label: t("ADMIN"),
          path: "/admin",
          icon: "",
          searchIndex: "admin dashboard",
        },
        {
          key: "admin-orders",
          label: t("ADMIN ORDERS"),
          path: "/admin/orders",
          icon: "",
          searchIndex: "admin orders management",
        }
      );
    }

    const menuLinks = [
      ...menuData.device.map((item) => ({
        key: `device-${item.label}`,
        label: t(item.label),
        path: `/device/${toSlug(item.label)}`,
        icon: item.icon,
        searchIndex: `${item.label} ${t(item.label)} device`,
      })),
      ...menuData.category.map((item) => ({
        key: `category-${item.label}`,
        label: t(item.label),
        path: `/category/${toSlug(item.label)}`,
        icon: item.icon,
        searchIndex: `${item.label} ${t(item.label)} category`,
      })),
      ...menuData.faq.map((item) => ({
        key: `faq-${item.label}`,
        label: t(item.label),
        path: `/faq/${toSlug(item.label)}`,
        icon: item.icon,
        searchIndex: `${item.label} ${t(item.label)} faq support`,
      })),
    ];

    return [...links, ...menuLinks];
  }, [menuData, t, user]);

  const filteredQuickLinks = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();
    if (!term) return quickLinks.slice(0, 8);
    return quickLinks
      .filter((item) =>
        `${item.label} ${item.searchIndex}`.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [globalSearch, quickLinks]);

  const closeGlobalSearch = () => {
    setGlobalSearchOpen(false);
    setGlobalSearch("");
    setProductResults([]);
  };

  const navigateFromSearch = (path) => {
    navigate(path);
    setOpenDropdown(null);
    setMobileOpen(false);
    closeGlobalSearch();
  };

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    const term = globalSearch.trim();
    if (!term) return;

    if (productResults.length > 0 && productResults[0]?._id) {
      navigateFromSearch(`/product/${productResults[0]._id}`);
      return;
    }

    if (filteredQuickLinks.length > 0) {
      navigateFromSearch(filteredQuickLinks[0].path);
      return;
    }

    navigateFromSearch(`/products?q=${encodeURIComponent(term)}`);
  };

  const Dropdown = ({ dropdownKey, title, items, basePath, searchable }) => {
    const filteredItems = searchable
      ? items.filter((i) =>
          i.label.toLowerCase().includes(faqSearch.toLowerCase())
        )
      : items;

    return (
      <div
        className="relative"
        data-dropdown="true"
        ref={dropdownRef}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)
          }
          className="flex items-center gap-1 hover:text-teal-600"
          aria-expanded={openDropdown === dropdownKey}
          aria-haspopup="menu"
        >
          {title}
          <ChevronDown size={16} />
        </button>

        {openDropdown === dropdownKey && (
          <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50">
            {searchable && (
              <input
                className="w-full px-3 py-2 border-b text-sm outline-none"
                placeholder={t("Search FAQ...")}
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
            )}

            <ul className="py-2">
              {filteredItems.map((item) => {
                const path = `/${basePath}/${toSlug(item.label)}`;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(path);
                        setOpenDropdown(null);
                        setMobileOpen(false);
                      }}
                    >
                      <span>{item.icon}</span>
                      {t(item.label)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const SimpleDropdown = ({ dropdownKey, title, items }) => (
    <div
      className="relative"
      data-dropdown="true"
      ref={dropdownRef}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() =>
          setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)
        }
        className="flex items-center gap-1 hover:text-teal-600"
        aria-expanded={openDropdown === dropdownKey}
        aria-haspopup="menu"
      >
        {title}
        <ChevronDown size={16} />
      </button>
      {openDropdown === dropdownKey && (
        <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50">
          <ul className="py-2">
            {items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                    setOpenDropdown(null);
                    setMobileOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full">
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-slate-900 px-6 py-2 text-white text-xs md:text-sm font-semibold">
        <button className="px-2" onClick={() => setTopIndex((i) => (i - 1 + 4) % 4)}>
          <ChevronLeft />
        </button>
        <span className="text-center flex-1">
          {[
            t("ROHS | REACH | SVHC | CE COMPLIANT"),
            t("Free shipping above ?999"),
            t("1-year warranty on select devices"),
            t("24/7 support for all orders"),
          ][topIndex]}
        </span>
        <button className="px-2" onClick={() => setTopIndex((i) => (i + 1) % 4)}>
          <ChevronRight />
        </button>
      </div>

      <div className="flex items-center justify-between bg-white/90 backdrop-blur px-6 py-4 shadow-md sticky top-0 z-40">
        <Link to="/">
          <h1 className="text-3xl font-bold text-blue-600 heading tracking-tight">
            {t("CELL")}
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-teal-600" : "")}>
            {t("HOME")}
          </NavLink>

          <Dropdown
            dropdownKey="desktop-device"
            title={t("DEVICE")}
            items={menuData.device}
            basePath="device"
          />
          <Dropdown
            dropdownKey="desktop-category"
            title={t("CATEGORY")}
            items={menuData.category}
            basePath="category"
          />
          <NavLink to="/products">{t("PRODUCTS")}</NavLink>

          {user?.role === "admin" && (
            <SimpleDropdown
              dropdownKey="desktop-admin"
              title={t("ADMIN")}
              items={[
                { label: t("ADMIN"), path: "/admin" },
                { label: t("ADMIN ORDERS"), path: "/admin/orders" },
              ]}
            />
          )}
          <NavLink to="/orders">{t("MY ORDERS")}</NavLink>
          {user && <NavLink to="/profile">{t("PROFILE")}</NavLink>}
          {user && (
            <NavLink to="/wishlist" className="relative">
              {t("WISHLIST")}
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </NavLink>
          )}

          <NavLink to="/warranty">{t("WARRANTY")}</NavLink>

          <Dropdown
            dropdownKey="desktop-faq"
            title={t("FAQ")}
            items={menuData.faq}
            basePath="faq"
            searchable
          />

          <NavLink to="/about">{t("ABOUT US")}</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <div
            className="relative"
            data-global-search="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="cursor-pointer hover:text-teal-600"
              onClick={() => setGlobalSearchOpen((open) => !open)}
              aria-label={t("Search")}
            >
              <Search size={20} />
            </button>

            {globalSearchOpen && (
              <div className="absolute right-0 mt-3 w-[22rem] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                <form onSubmit={handleGlobalSearchSubmit} className="border-b p-2">
                  <input
                    ref={searchInputRef}
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={t("Search by name or brand...")}
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-teal-500"
                  />
                </form>

                <div className="max-h-80 overflow-y-auto">
                  {filteredQuickLinks.length > 0 && (
                    <>
                      <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500">
                        {t("Navigation")}
                      </p>
                      <ul className="pb-1">
                        {filteredQuickLinks.map((item) => (
                          <li key={item.key}>
                            <button
                              type="button"
                              className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-100"
                              onClick={() => navigateFromSearch(item.path)}
                            >
                              <span className="truncate">
                                {item.icon ? `${item.icon} ` : ""}
                                {item.label}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {productResults.length > 0 && (
                    <>
                      <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500">
                        {t("Products")}
                      </p>
                      <ul className="pb-2">
                        {productResults.map((product) => (
                          <li key={product._id}>
                            <button
                              type="button"
                              className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-100"
                              onClick={() => navigateFromSearch(`/product/${product._id}`)}
                            >
                              <span className="truncate">{product.name}</span>
                              <span className="text-xs text-gray-500 truncate">
                                {product.brand || t("Product")}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {globalSearch.trim() &&
                    filteredQuickLinks.length === 0 &&
                    productResults.length === 0 && (
                      <p className="px-3 py-3 text-sm text-gray-500">{t("No results found")}</p>
                    )}
                </div>
              </div>
            )}
          </div>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1 bg-slate-900 text-white rounded-full text-sm"
            >
              {t("Login")}
            </button>
          ) : (
            <button onClick={() => logout("manual")} className="px-3 py-1 border rounded-full text-sm">
              {t("Logout")}
            </button>
          )}

          <Link to="/cart" className="relative">
            <ShoppingBag />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setDark(!dark)}>
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <select
            className="text-xs border rounded px-2 py-1"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            <option value="en">{t("English")}</option>
            <option value="it">{t("Italian")}</option>
          </select>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
          <NavLink to="/">{t("HOME")}</NavLink>

          <Dropdown
            dropdownKey="mobile-device"
            title={t("DEVICE")}
            items={menuData.device}
            basePath="device"
          />
          <Dropdown
            dropdownKey="mobile-category"
            title={t("CATEGORY")}
            items={menuData.category}
            basePath="category"
          />
          <NavLink to="/products">{t("PRODUCTS")}</NavLink>

          <NavLink to="/orders">{t("MY ORDERS")}</NavLink>
          {user && <NavLink to="/profile">{t("PROFILE")}</NavLink>}
          {user && <NavLink to="/wishlist">{t("WISHLIST")}</NavLink>}
          {user?.role === "admin" && (
            <SimpleDropdown
              dropdownKey="mobile-admin"
              title={t("ADMIN")}
              items={[
                { label: t("ADMIN"), path: "/admin" },
                { label: t("ADMIN ORDERS"), path: "/admin/orders" },
              ]}
            />
          )}

          <NavLink to="/warranty">{t("WARRANTY")}</NavLink>
          <Dropdown
            dropdownKey="mobile-faq"
            title={t("FAQ")}
            items={menuData.faq}
            basePath="faq"
            searchable
          />
          <NavLink to="/about">{t("ABOUT US")}</NavLink>
        </div>
      )}
    </header>
  );
}
