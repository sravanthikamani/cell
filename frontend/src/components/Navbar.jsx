import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  ShoppingBag,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function Navbar() {
  /* ✅ CONTEXTS (ONLY ONCE, AT TOP) */
  const { cartCount } = useCart();
  const { dark, setDark } = useTheme();
  const { user, login, logout } = useAuth(); // ✅ ADD HERE
  const { lang, setLang, t } = useI18n();
  const [wishlistCount, setWishlistCount] = useState(0);

  /* ✅ STATE */
  const [menuData, setMenuData] = useState({
    device: [],
    category: [],
    faq: [],
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [topIndex, setTopIndex] = useState(0);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ✅ FETCH MENU */
  useEffect(() => {
    fetch(`${API_BASE}/api/menu`)
      .then((res) => res.json())
      .then(setMenuData)
      .catch(() => {
        setMenuData({ device: [], category: [], faq: [] });
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

  /* ✅ CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest("[data-dropdown='true']")) return;
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ✅ ESC KEY CLOSE */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setOpenDropdown(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopIndex((i) => (i + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  /* ✅ DROPDOWN COMPONENT */
  const Dropdown = ({ title, items, basePath, searchable }) => {
    const filteredItems = searchable
      ? items.filter((i) =>
          i.label.toLowerCase().includes(faqSearch.toLowerCase())
        )
      : items;

    return (
      <div className="relative" data-dropdown="true" ref={dropdownRef}>
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === title ? null : title)
          }
          className="flex items-center gap-1 hover:text-teal-600"
        >
          {title}
          <ChevronDown size={16} />
        </button>

        {openDropdown === title && (
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
                const path = `/${basePath}/${encodeURIComponent(
                  item.label.toLowerCase()
                )}`;
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

  return (
    <header className="w-full">

      {/* 🔹 TOP BAR */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-slate-900 px-6 py-2 text-white text-xs md:text-sm font-semibold">
        <button
          className="px-2"
          onClick={() =>
            setTopIndex((i) => (i - 1 + 4) % 4)
          }
        >
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
        <button
          className="px-2"
          onClick={() => setTopIndex((i) => (i + 1) % 4)}
        >
          <ChevronRight />
        </button>
      </div>

      {/* 🔹 NAVBAR */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur px-6 py-4 shadow-md sticky top-0 z-40">

        {/* LOGO */}
        <Link to="/">
          <h1 className="text-3xl font-bold text-blue-600 heading tracking-tight">
            {t("CELL")}
          </h1>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
  <NavLink to="/" className={({ isActive }) =>
    isActive ? "text-teal-600" : ""
  }>
    {t("HOME")}
  </NavLink>

  <Dropdown title={t("DEVICE")} items={menuData.device} basePath="device" />
  <Dropdown title={t("CATEGORY")} items={menuData.category} basePath="category" />
  <NavLink to="/products">{t("PRODUCTS")}</NavLink>

{user?.role === "admin" && (
  <>
  <NavLink to="/admin">{t("ADMIN")}</NavLink>
      <NavLink to="/admin/orders">{t("ADMIN ORDERS")}</NavLink>
      </>
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
    title={t("FAQ")}
    items={menuData.faq}
    basePath="faq"
    searchable
  />

  <NavLink to="/about">{t("ABOUT US")}</NavLink>
</nav>


        {/* ICONS */}
<div className="hidden md:flex items-center gap-6">
  <Search className="cursor-pointer" />

{/* ✅ LOGIN / LOGOUT */}
{!user ? (
  <button
    onClick={() => navigate("/login")}
    className="px-3 py-1 bg-slate-900 text-white rounded-full text-sm"
  >
    {t("Login")}
  </button>
) : (
  <button
    onClick={logout}
    className="px-3 py-1 border rounded-full text-sm"
  >
    {t("Logout")}
  </button>
)}

  {/* CART ICON */}
  <Link to="/cart" className="relative">
    <ShoppingBag />
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
        {cartCount}
      </span>
    )}
  </Link>

  {/* DARK MODE */}
  <button onClick={() => setDark(!dark)}>
    {dark ? "🌙" : "☀️"}
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



        {/* MOBILE BUTTON */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
{mobileOpen && (
  <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
    <NavLink to="/">{t("HOME")}</NavLink>

    <Dropdown title={t("DEVICE")} items={menuData.device} basePath="device" />
    <Dropdown title={t("CATEGORY")} items={menuData.category} basePath="category" />
    <NavLink to="/products">{t("PRODUCTS")}</NavLink>

    <NavLink to="/orders">{t("MY ORDERS")}</NavLink>
    {user && <NavLink to="/profile">{t("PROFILE")}</NavLink>}
    {user && <NavLink to="/wishlist">{t("WISHLIST")}</NavLink>}
    {user?.role === "admin" && (
      <>
        <NavLink to="/admin">{t("ADMIN")}</NavLink>
        <NavLink to="/admin/orders">{t("ADMIN ORDERS")}</NavLink>
      </>
    )}

    <NavLink to="/warranty">{t("WARRANTY")}</NavLink>
    <Dropdown title={t("FAQ")} items={menuData.faq} basePath="faq" searchable />
    <NavLink to="/about">{t("ABOUT US")}</NavLink>
  </div>
)}

    </header>
  );
}
