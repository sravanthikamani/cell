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

export default function Navbar() {
  /* ✅ CONTEXTS (ONLY ONCE, AT TOP) */
  const { cartCount } = useCart();
  const { dark, setDark } = useTheme();
  const { user, login, logout } = useAuth(); // ✅ ADD HERE

  /* ✅ STATE */
  const [menuData, setMenuData] = useState({
    device: [],
    category: [],
    faq: [],
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ✅ FETCH MENU */
  useEffect(() => {
    fetch("http://localhost:5000/api/menu")
      .then((res) => res.json())
      .then(setMenuData)
      .catch(() => {
        setMenuData({ device: [], category: [], faq: [] });
      });
  }, []);

  /* ✅ CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
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

  /* ✅ DROPDOWN COMPONENT */
  const Dropdown = ({ title, items, basePath, searchable }) => {
    const filteredItems = searchable
      ? items.filter((i) =>
          i.label.toLowerCase().includes(faqSearch.toLowerCase())
        )
      : items;

    return (
      <div className="relative" ref={dropdownRef}>
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
                placeholder="Search FAQ..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
            )}

            <ul className="py-2">
              {filteredItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate(`/${basePath}/${item.label.toLowerCase()}`);
                    setOpenDropdown(null);
                    setMobileOpen(false);
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="w-full">

      {/* 🔹 TOP BAR */}
      <div className="flex items-center justify-between bg-teal-500 px-6 py-2 text-white text-sm font-semibold">
        <ChevronLeft />
        ROHS | REACH | SVHC | CE COMPLIANT
        <ChevronRight />
      </div>

      {/* 🔹 NAVBAR */}
      <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md">

        {/* LOGO */}
        <Link to="/">
          <h1 className="text-3xl font-bold text-teal-600">CELL</h1>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
  <NavLink to="/" className={({ isActive }) =>
    isActive ? "text-teal-600" : ""
  }>
    HOME
  </NavLink>

  <Dropdown title="DEVICE" items={menuData.device} basePath="device" />
  <Dropdown title="CATEGORY" items={menuData.category} basePath="category" />
  <NavLink to="/products">PRODUCTS</NavLink>

{user?.role === "admin" && (
  <>
  <NavLink to="/admin">ADMIN</NavLink>
      <NavLink to="/admin/orders">ADMIN ORDERS</NavLink>
      </>
)}
  <NavLink to="/orders">MY ORDERS</NavLink>

  <NavLink to="/warranty">WARRANTY</NavLink>

  <Dropdown
    title="FAQ"
    items={menuData.faq}
    basePath="faq"
    searchable
  />

  <NavLink to="/about">ABOUT US</NavLink>
</nav>


        {/* ICONS */}
<div className="hidden md:flex items-center gap-6">
  <Search className="cursor-pointer" />

{/* ✅ LOGIN / LOGOUT */}
{!user ? (
  <button
    onClick={() => navigate("/login")}
    className="px-3 py-1 bg-black text-white rounded text-sm"
  >
    Login
  </button>
) : (
  <button
    onClick={logout}
    className="px-3 py-1 border rounded text-sm"
  >
    Logout
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
</div>



        {/* MOBILE BUTTON */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
{mobileOpen && (
  <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
    <NavLink to="/">HOME</NavLink>

    <Dropdown title="DEVICE" items={menuData.device} basePath="device" />
    <Dropdown title="CATEGORY" items={menuData.category} basePath="category" />

    <NavLink to="/orders">MY ORDERS</NavLink>

    <NavLink to="/warranty">WARRANTY</NavLink>
    <Dropdown title="FAQ" items={menuData.faq} basePath="faq" searchable />
    <NavLink to="/about">ABOUT US</NavLink>
  </div>
)}

    </header>
  );
}
