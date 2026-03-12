import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { decodeJwtRole, isAdminRole } from "../lib/auth";
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

const NAVBAR_GRADIENT_CLASS = "bg-[linear-gradient(90deg,#051937_0%,#004d7a_25%,#008793_50%,#00bf72_75%,#a8eb12_100%)]";
const ACTIVE_NAV_CLASS = "text-red-400 animate-pulse [text-shadow:0_0_10px_rgba(248,113,113,0.9)]";
const FAQ_ACTIVE_NAV_CLASS = "text-[#ff4fa3] animate-pulse [text-shadow:0_0_10px_rgba(255,79,163,0.9)]";

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

const Dropdown = ({
  dropdownKey,
  title,
  items,
  basePath,
  searchable,
  openDropdown,
  setOpenDropdown,
  faqSearch,
  setFaqSearch,
  toSlug,
  navigate,
  setMobileOpen,
  dropdownRef,
  isActive,
  t,
}) => {
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
        className={`flex items-center gap-1 hover:text-blue-600 ${isActive ? ACTIVE_NAV_CLASS : ""}`}
        aria-expanded={openDropdown === dropdownKey}
        aria-haspopup="menu"
      >
        {title}
        <ChevronDown size={16} />
      </button>

      {openDropdown === dropdownKey && (
        <div className="absolute left-0 mt-2 w-56 bg-slate-900/95 border border-white/15 shadow-lg rounded-md z-50">
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
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10"
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

const SimpleDropdown = ({
  dropdownKey,
  title,
  items,
  openDropdown,
  setOpenDropdown,
  navigate,
  setMobileOpen,
  dropdownRef,
  isActive,
}) => (
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
      className={`flex items-center gap-1 hover:text-blue-600 ${isActive ? ACTIVE_NAV_CLASS : ""}`}
      aria-expanded={openDropdown === dropdownKey}
      aria-haspopup="menu"
    >
      {title}
      <ChevronDown size={16} />
    </button>
    {openDropdown === dropdownKey && (
      <div className="absolute left-0 mt-2 w-56 bg-slate-900/95 border border-white/15 shadow-lg rounded-md z-50">
        <ul className="py-2">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10"
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

const FaqBubbleIcon = ({ size = 22, className = "" }) => (
  <FontAwesomeIcon icon={faCircleQuestion} className={className} style={{ fontSize: `${size}px` }} />
);

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, token, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [wishlistCount, setWishlistCount] = useState(0);
  const isAdmin = isAdminRole(user?.role) || isAdminRole(decodeJwtRole(token));

  // Icon color
  const iconColor = "#ffffff";

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
  const location = useLocation();
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
    if (!user) return;

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
    if (!globalSearchOpen || term.length < 2) return;

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

    if (isAdmin) {
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
    ];

    return [...links, ...menuLinks];
  }, [isAdmin, menuData, t, user]);

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

  const desktopNavClass = ({ isActive }) =>
    isActive ? ACTIVE_NAV_CLASS : "";
  const desktopRelativeNavClass = ({ isActive }) =>
    `relative ${isActive ? ACTIVE_NAV_CLASS : ""}`.trim();
  const mobileNavClass = ({ isActive }) =>
    `block py-2 text-base font-medium ${isActive ? "text-red-500 animate-pulse [text-shadow:0_0_8px_rgba(239,68,68,0.5)]" : "text-gray-800"}`;
  const mobileFaqNavClass = ({ isActive }) =>
    `flex items-center gap-2 py-2 text-base font-medium ${isActive ? "text-[#ff4fa3] animate-pulse [text-shadow:0_0_8px_rgba(255,79,163,0.6)]" : "text-gray-800"}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-slate-900 px-6 py-2 text-white text-xs lg:text-sm font-semibold">
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

      <div className={`flex items-center justify-between px-4 lg:px-6 py-2 lg:py-4 shadow-md sticky top-0 z-40 text-white ${NAVBAR_GRADIENT_CLASS}`}>
        <Link to="/">
          <img 
            src="/images/logo.png"
            alt="CELL Logo"
            className="h-12 lg:h-20 object-contain bg-transparent"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-4 lg:gap-8 text-sm font-semibold text-white/95">
          <NavLink to="/" className={desktopNavClass}>
            {t("HOME")}
          </NavLink>

          <Dropdown
            dropdownKey="desktop-device"
            title={t("DEVICE")}
            items={menuData.device}
            basePath="device"
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            faqSearch={faqSearch}
            setFaqSearch={setFaqSearch}
            toSlug={toSlug}
            navigate={navigate}
            setMobileOpen={setMobileOpen}
            dropdownRef={dropdownRef}
            isActive={location.pathname.startsWith("/device/")}
            t={t}
          />
          <Dropdown
            dropdownKey="desktop-category"
            title={t("CATEGORY")}
            items={menuData.category}
            basePath="category"
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            faqSearch={faqSearch}
            setFaqSearch={setFaqSearch}
            toSlug={toSlug}
            navigate={navigate}
            setMobileOpen={setMobileOpen}
            dropdownRef={dropdownRef}
            isActive={location.pathname.startsWith("/category/")}
            t={t}
          />
          <NavLink to="/products" className={desktopNavClass}>{t("PRODUCTS")}</NavLink>

          {isAdmin && (
            <SimpleDropdown
              dropdownKey="desktop-admin"
              title={t("ADMIN")}
              items={[
                { label: t("ADMIN"), path: "/admin" },
                { label: t("ADMIN ORDERS"), path: "/admin/orders" },
              ]}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              navigate={navigate}
              setMobileOpen={setMobileOpen}
              dropdownRef={dropdownRef}
              isActive={location.pathname.startsWith("/admin")}
            />
          )}
          <NavLink to="/orders" className={desktopNavClass}>{t("MY ORDERS")}</NavLink>
          {user && <NavLink to="/profile" className={desktopNavClass}>{t("PROFILE")}</NavLink>}
          {user && (
            <NavLink to="/wishlist" className={desktopRelativeNavClass}>
              {t("WISHLIST")}
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </NavLink>
          )}
          <NavLink to="/about" className={desktopNavClass}>{t("ABOUT US")}</NavLink>

        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <NavLink
            to="/faq"
            className={({ isActive }) => `group cursor-pointer transition hover:scale-110 ${isActive ? FAQ_ACTIVE_NAV_CLASS : ""}`}
            aria-label={t("FAQ")}
            title={t("FAQ")}
          >
            <FaqBubbleIcon size={22} className="text-current" />
          </NavLink>

          <div
            className="relative"
            data-global-search="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="cursor-pointer hover:text-white/80"
              onClick={() => setGlobalSearchOpen((open) => !open)}
              aria-label={t("Search")}
            >
              <Search size={20} color={iconColor} />
            </button>

            {globalSearchOpen && (
              <div className="absolute right-0 mt-3 w-[22rem] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                <form onSubmit={handleGlobalSearchSubmit} className="border-b p-2">
                  <input
                    ref={searchInputRef}
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={t("Search by name or brand...")}
                    className="w-full rounded border px-3 py-2 text-sm text-black placeholder:text-gray-500 outline-none focus:border-teal-500"
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
              className="text-sm font-semibold hover:text-blue-600"
            >
              {t("Login")}
            </button>
          ) : (
            <button onClick={() => logout("manual")} className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-bold border border-white">
              {t("Logout")}
            </button>
          )}

          <Link to="/cart" className="relative">
            <ShoppingBag color={iconColor} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <select
            className="text-xs border rounded px-2 py-1 bg-white text-slate-800"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            <option value="en">{t("English")}</option>
            <option value="it">{t("Italian")}</option>
          </select>
        </div>

        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden bg-white shadow-lg px-6 py-3 space-y-1 border-t max-h-[calc(100vh-8.5rem)] overflow-y-auto overscroll-contain"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
            {t("HOME")}
          </NavLink>

          <div className="py-1">
              <button
                type="button"
                className="w-full flex items-center justify-between py-1.5 text-base font-medium text-gray-800"
                onClick={() =>
                  setOpenDropdown(openDropdown === "mobile-device" ? null : "mobile-device")
                }
              >
              {t("DEVICE")}
              <ChevronDown size={18} />
            </button>
            {openDropdown === "mobile-device" && (
              <div className="pl-4 pb-1 space-y-2">
                {menuData.device.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="block w-full text-left py-1.5 text-sm text-gray-700"
                    onClick={() => {
                      navigate(`/device/${toSlug(item.label)}`);
                      setOpenDropdown(null);
                      setMobileOpen(false);
                    }}
                  >
                    {t(item.label)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="py-1">
              <button
                type="button"
                className="w-full flex items-center justify-between py-1.5 text-base font-medium text-gray-800"
                onClick={() =>
                  setOpenDropdown(openDropdown === "mobile-category" ? null : "mobile-category")
                }
              >
              {t("CATEGORY")}
              <ChevronDown size={18} />
            </button>
            {openDropdown === "mobile-category" && (
              <div className="pl-4 pb-1 space-y-2">
                {menuData.category.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="block w-full text-left py-1.5 text-sm text-gray-700"
                    onClick={() => {
                      navigate(`/category/${toSlug(item.label)}`);
                      setOpenDropdown(null);
                      setMobileOpen(false);
                    }}
                  >
                    {t(item.label)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/products" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
            {t("PRODUCTS")}
          </NavLink>
          <NavLink to="/faq" onClick={() => setMobileOpen(false)} className={mobileFaqNavClass}>
            <FaqBubbleIcon size={16} className="text-current" />
            <span>{t("FAQ")}</span>
          </NavLink>
          <NavLink to="/orders" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
            {t("MY ORDERS")}
          </NavLink>
          {user && (
            <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
              {t("PROFILE")}
            </NavLink>
          )}
          {user && (
            <NavLink to="/wishlist" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
              {t("WISHLIST")}
            </NavLink>
          )}
          <NavLink to="/about" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
            {t("ABOUT US")}
          </NavLink>
          <NavLink to="/cart" onClick={() => setMobileOpen(false)} className={mobileNavClass}>
            {t("CART")} ({cartCount})
          </NavLink>

          {isAdmin && (
            <div className="py-1">
              <button
                type="button"
                className="w-full flex items-center justify-between py-1.5 text-base font-medium text-gray-800"
                onClick={() =>
                  setOpenDropdown(openDropdown === "mobile-admin" ? null : "mobile-admin")
                }
              >
                {t("ADMIN")}
                <ChevronDown size={18} />
              </button>
              {openDropdown === "mobile-admin" && (
                <div className="pl-4 pb-1 space-y-2">
                  <button
                    type="button"
                    className="block w-full text-left py-1.5 text-sm text-gray-700"
                    onClick={() => {
                      navigate("/admin");
                      setOpenDropdown(null);
                      setMobileOpen(false);
                    }}
                  >
                    {t("ADMIN")}
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left py-1.5 text-sm text-gray-700"
                    onClick={() => {
                      navigate("/admin/orders");
                      setOpenDropdown(null);
                      setMobileOpen(false);
                    }}
                  >
                    {t("ADMIN ORDERS")}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {t("Language")}
            </label>
            <select
              className="w-full text-sm border rounded px-2 py-2"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
            >
              <option value="en">{t("English")}</option>
              <option value="it">{t("Italian")}</option>
            </select>
          </div>

          <div className="pt-1">
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
                className="w-full text-left py-2 text-base font-medium text-gray-800"
              >
                {t("Login")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout("manual");
                }}
                className="w-full px-3 py-2 bg-white border border-white rounded-md text-sm font-bold text-blue-700"
              >
                {t("Logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
