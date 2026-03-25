import { CartProvider } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import UrlNormalizer from "./components/UrlNormalizer";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import Products from "./pages/Products";
import Login from "./pages/Login";
import AdminRoute from "./routes/AdminRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import SessionTimeout from "./pages/SessionTimeout";

import Contact from "./pages/Contact";

const Home = lazy(() => import("./pages/Home"));
const Warranty = lazy(() => import("./pages/Warranty"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Offers = lazy(() => import("./pages/Offers"));

export default function App() {
  const { user, token } = useAuth();
  return (
    <CartProvider user={user} token={token}>
      <UrlNormalizer />
      <Navbar />
      <main className="pt-36 md:pt-40 app-content" id="main-content">
        <Suspense fallback={<div className="p-10">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/:group/:type" element={<CatalogPage />} />
            <Route path="/:group/:type/:brand" element={<BrandPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/faq/:item" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/session-timeout" element={<SessionTimeout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/warranty" element={<ProtectedRoute><Warranty /></ProtectedRoute>} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </CartProvider>
  );
}
