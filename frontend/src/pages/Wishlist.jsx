import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";

export default function Wishlist() {
  const { token, user } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user || !token) return;
    fetch(`${API_BASE}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data.products || []));
  }, [user, token]);

  const remove = async (productId) => {
    await fetch(`${API_BASE}/api/wishlist/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    setItems((list) => list.filter((p) => p._id !== productId));
  };

  const addToCart = async (productId) => {
    await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.id, productId }),
    });
    await refreshCart();
  };

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Wishlist</h1>
      {items.length === 0 && <p>No items in wishlist</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p._id} className="card p-4">
            <Link to={`/product/${p._id}`}>
              <img
                src={
                  p.images?.[0]?.startsWith("/uploads")
                    ? `${API_BASE}${p.images?.[0]}`
                    : p.images?.[0]
                }
                alt={p.name}
                className="h-40 w-full object-cover"
              />
              <h2 className="font-bold mt-2">{p.name}</h2>
            </Link>
            <p className="mt-1">₹{p.price}</p>
            <div className="mt-3 flex gap-3">
              <button
                className="bg-black text-white px-4 py-1"
                onClick={() => addToCart(p._id)}
              >
                Add to Cart
              </button>
              <button
                className="text-red-600"
                onClick={() => remove(p._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
