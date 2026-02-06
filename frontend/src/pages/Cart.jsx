import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
const { refreshCart } = useCart();

 // ✅ FIRST GUARD
  if (!user || !token) {
    return <div className="p-10">Loading cart...</div>;
  }

  // ✅ SAFE NOW
  const USER_ID = user.id;

  const fetchCart = () => {
    fetch(`http://localhost:5000/api/cart/${USER_ID}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then(setCart);
  };

  useEffect(() => {
    if (USER_ID && token) {
      fetchCart();
    }
  }, [USER_ID, token]);

  const updateQty = (productId, qty) => {
  fetch("http://localhost:5000/api/cart/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      userId: USER_ID,
      productId,
      qty,
    }),
  }).then(() => {
    fetchCart();
    refreshCart(); // ✅ UPDATE ICON
  });
};


 const removeItem = (productId) => {
  fetch("http://localhost:5000/api/cart/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      userId: USER_ID,
      productId,
    }),
  }).then(() => {
    fetchCart();
    refreshCart(); // ✅ UPDATE ICON
  });
};


  if (!cart) {
    return <div className="p-10">Loading cart...</div>;
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.productId.price * item.qty,
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.items.length === 0 && <p>Cart is empty</p>}

      {cart.items.map(({ productId, qty }) => (
        <div
          key={productId._id}
          className="flex items-center justify-between border-b py-4"
        >
          <div>
            <h2 className="font-semibold">{productId.name}</h2>
            <p className="text-gray-500">₹{productId.price}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => updateQty(productId._id, qty - 1)}
              disabled={qty === 1}
              className="px-3 py-1 border"
            >
              −
            </button>

            <span>{qty}</span>

            <button
              onClick={() => updateQty(productId._id, qty + 1)}
              className="px-3 py-1 border"
            >
              +
            </button>

            <button
              onClick={() => removeItem(productId._id)}
              className="text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="text-right mt-6 text-xl font-bold">
        Total: ₹{total}
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="mt-6 bg-black text-white px-6 py-2"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
