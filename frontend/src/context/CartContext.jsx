import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { getUserId, fetchCartCount } from "../lib/user";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    const userId = getUserId(user);
    if (!userId || !token) {
      setCartCount(0);
      return 0;
    }
    const count = await fetchCartCount(userId, token, API_BASE);
    setCartCount(count);
    return count;
  }, [token, user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
