import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { getUserId, fetchCartCount } from "../lib/user";

const CartContext = createContext();

export function CartProvider({ children, user, token }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    const userId = getUserId(user);
    const count = await fetchCartCount(userId, token, API_BASE);
    setCartCount(count);
  };

  useEffect(() => {
    refreshCart();
  }, [user, token]);

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
