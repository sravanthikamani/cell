import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [group, setGroup] = useState("");
  const [type, setType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [catalogOptions, setCatalogOptions] = useState({
    groups: [],
    types: [],
    brands: [],
  });
  const [catalogTree, setCatalogTree] = useState({});

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

      const url = `${API_BASE}/api/products/search?${params.toString()}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(console.error);
    }, 300);

    return () => clearTimeout(timer);
  }, [q, brand, group, type, priceMin, priceMax]);

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
      alert("Login first");
      return;
    }

    await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        productId,
      }),
    });

    await refreshCart(); // ✅ cart icon updates
    alert("Added to cart");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="card p-4 md:p-5 mb-8 animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          className="md:col-span-2 border px-3 py-2"
          placeholder="Search by name or brand..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border px-3 py-2 bg-white"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {getBrandOptions().map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="border px-3 py-2 bg-white"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="">All Groups</option>
          {catalogOptions.groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          className="border px-3 py-2 bg-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {getTypeOptions().map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className="border px-3 py-2"
            placeholder="Min ₹"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <input
            className="border px-3 py-2"
            placeholder="Max ₹"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
          <button
            className="bg-gray-100 border px-3 py-2"
            onClick={() => {
              setQ("");
              setBrand("");
              setGroup("");
              setType("");
              setPriceMin("");
              setPriceMax("");
            }}
          >
            Clear Filters
          </button>
        </div>
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

            <p className="mt-1">₹{p.price}</p>
            <p className="mt-1 text-sm text-gray-600">
              {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
            </p>

            <button
              onClick={() => addToCart(p._id)}
              className="mt-3 btn-primary disabled:opacity-50"
              disabled={p.stock <= 0}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
