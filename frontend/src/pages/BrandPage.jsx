import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Helmet } from "react-helmet-async";

export default function BrandPage() {
  const { group, type, brand } = useParams();
  const navigate = useNavigate();
  const { updateCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    ram: "",
    storage: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/catalog")
      .then(res => res.json())
      .then(data => {
        const list =
          data[group]?.[type]?.[brand] || [];
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
      <Helmet>
        <title>{brand} {type} | CELL</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {brand} {type}
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <select
          className="border p-2"
          onChange={e => setFilters(f => ({ ...f, ram: e.target.value }))}
        >
          <option value="">RAM</option>
          <option>8GB</option>
          <option>12GB</option>
        </select>

        <select
          className="border p-2"
          onChange={e => setFilters(f => ({ ...f, storage: e.target.value }))}
        >
          <option value="">Storage</option>
          <option>128GB</option>
          <option>256GB</option>
        </select>

        <input
          type="number"
          placeholder="Max Price"
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
            key={product.id}
            className="border rounded-lg p-4 hover:shadow-lg"
          >
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-gray-600">₹{product.price}</p>
            <p className="text-sm">
              {product.ram} | {product.storage}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="border px-4 py-1"
              >
                View
              </button>

              <button
                onClick={() => updateCart(1)}
                className="bg-teal-600 text-white px-4 py-1"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
