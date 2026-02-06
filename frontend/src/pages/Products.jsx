import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const { user, token } = useAuth();
  const { refreshCart } = useCart();

  // 🔹 Load all products
  useEffect(() => {
    fetch("http://localhost:5000/api/catalog")
      .then(res => res.json())
      .then(data => {
        const list = [];
        Object.values(data).forEach(g =>
          Object.values(g).forEach(t =>
            Object.values(t).forEach(b =>
              b.forEach(p => list.push(p))
            )
          )
        );
        setProducts(list);
      });
  }, []);

  // 🔹 Add to cart
  const addToCart = async (productId) => {
    if (!user) {
      alert("Login first");
      return;
    }

    await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
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
    <div className="max-w-6xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="border p-4 rounded">

            {/* 🔗 GO TO PRODUCT PAGE */}
            <Link to={`/product/${p._id}`}>
              <img
                src={p.images?.[0]}
                alt={p.name}
                className="h-40 w-full object-cover cursor-pointer"
              />
              <h2 className="font-bold mt-2">{p.name}</h2>
            </Link>

            <p className="mt-1">₹{p.price}</p>

            <button
              onClick={() => addToCart(p._id)}
              className="mt-3 bg-black text-white px-4 py-1"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
