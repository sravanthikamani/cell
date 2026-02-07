import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
const { refreshCart } = useCart();
  const { t, lang } = useI18n();

 // ✅ FIRST GUARD
  if (!user || !token) {
    return <div className="p-10">{t("Loading cart...")}</div>;
  }

  // ✅ SAFE NOW
  const USER_ID = user.id;

  const fetchCart = () => {
    fetch(`${API_BASE}/api/cart/${USER_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

  const updateQty = (productId, qty, variant) => {
  fetch(`${API_BASE}/api/cart/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: USER_ID,
      productId,
      qty,
      variant,
    }),
  }).then(() => {
    fetchCart();
    refreshCart(); // ✅ UPDATE ICON
  });
};


 const removeItem = (productId, variant) => {
  fetch(`${API_BASE}/api/cart/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: USER_ID,
      productId,
      variant,
    }),
  }).then(() => {
    fetchCart();
    refreshCart(); // ✅ UPDATE ICON
  });
};


  if (!cart) {
    return <div className="p-10">{t("Loading cart...")}</div>;
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.productId?.price;
    if (price == null) return sum;
    return sum + price * item.qty;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">{t("Your Cart")}</h1>

      {cart.items.length === 0 && <p>{t("Cart is empty")}</p>}

      {cart.items.map(({ productId, qty, variant }) => {
        if (!productId) {
          return (
            <div
              key={`missing-${Math.random()}`}
              className="card p-4 mb-3 flex items-center justify-between"
            >
              <div className="text-sm text-gray-600">
                {t("Product not found")}
              </div>
            </div>
          );
        }
        return (
        <div
          key={`${productId._id}-${variant?.color || ""}-${variant?.size || ""}`}
          className="card p-4 mb-3 flex items-center justify-between"
        >
          <div>
            <h2 className="font-semibold">{productId.name}</h2>
            {(variant?.color || variant?.size) && (
              <p className="text-sm text-gray-600">
                {variant?.color || ""} {variant?.size || ""}
              </p>
            )}
            <p className="text-gray-500">
              {formatCurrency(productId.price, lang)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => updateQty(productId._id, qty - 1, variant)}
              disabled={qty === 1}
              className="px-3 py-1 border rounded"
            >
              −
            </button>

            <span>{qty}</span>

            <button
              onClick={() => updateQty(productId._id, qty + 1, variant)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>

            <button
              onClick={() => removeItem(productId._id, variant)}
              className="text-red-600 text-sm"
            >
              {t("Remove")}
            </button>
          </div>
        </div>
        );
      })}

      <div className="text-right mt-6 text-xl font-bold">
        {t("Total:")} {formatCurrency(total, lang)}
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="mt-6 btn-primary"
      >
        {t("Proceed to Checkout")}
      </button>
    </div>
  );
}
