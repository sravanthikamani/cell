import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { t, lang } = useI18n();

  // keep an id even if user is null to allow hooks to run unconditionally
  const USER_ID = user?.id || user?._id;
  const cartBg =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772514348/ChatGPT_Image_Mar_3_2026_10_34_18_AM_m4bol0.png";

  const fetchCart = useCallback(() => {
    if (!USER_ID || !token) return;
    fetch(`${API_BASE}/api/cart/${USER_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setCart);
  }, [USER_ID, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ✅ FIRST GUARD - after all hooks have been declared
  if (!user || !token) {
    return <div className="p-10">{t("Loading cart...")}</div>;
  }

  // ✅ SAFE NOW

  const updateQty = async (productId, qty, variant) => {
    const res = await fetch(`${API_BASE}/api/cart/update`, {
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
    });
    if (!res.ok) return;
    await fetchCart();
    await refreshCart();
    window.location.reload();
  };

  const removeItem = async (productId, variant) => {
    const res = await fetch(`${API_BASE}/api/cart/remove`, {
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
    });
    if (!res.ok) return;
    await fetchCart();
    await refreshCart();
    window.location.reload();
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
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${cartBg})` }}
    >
      <div className="min-h-screen bg-white/80">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <h1 className="text-3xl font-bold mb-6">{t("Your Cart")}</h1>

          {cart.items.length === 0 && <p>{t("Cart is empty")}</p>}

          {cart.items.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn-primary"
              >
                {t("Shop More")}
              </button>
            </div>
          )}

          {cart.items.map(({ productId, qty, variant }, idx) => {
            if (!productId) {
              return (
                <div
                  key={`missing-${idx}`}
                  className="p-4 mb-3 flex items-center justify-between border border-black rounded"
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
                className="p-4 mb-3 flex items-center justify-between border border-black rounded"
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
                    className="text-black p-1"
                    aria-label={t("Remove")}
                    title={t("Remove")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="text-right mt-6 text-xl font-bold">
            {t("Total:")} {formatCurrency(total, lang)}
          </div>

          <button
            onClick={() =>
              navigate("/checkout", {
                state: {
                  cartSummary: {
                    subtotal: total,
                    items: cart.items,
                  },
                },
              })
            }
            className="mt-6 btn-primary"
          >
            {t("Proceed to Checkout")}
          </button>
        </div>
      </div>
    </div>
  );
}
