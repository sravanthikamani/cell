import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; 
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "./context/I18nContext";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </HelmetProvider>
);