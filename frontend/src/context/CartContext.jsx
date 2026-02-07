import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE } from "../lib/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user || !token) {
      setCartCount(0);
      return;
    }

    const res = await fetch(
      `${API_BASE}/api/cart/${user.id}`,
      {
        headers: { Authorization: token },
      }
    );

    const cart = await res.json();
    const count = cart.items?.reduce(
      (sum, item) => sum + item.qty,
      0
    ) || 0;

    setCartCount(count);
  };

  // 🔁 REFRESH CART COUNT WHEN USER LOGS IN
  useEffect(() => {
    fetchCartCount();
  }, [user, token]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart: fetchCartCount, // 👈 expose this
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
