import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import Products from "./pages/Products";
import Login from "./pages/Login";
import AdminRoute from "./routes/AdminRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";


const Home = lazy(() => import("./pages/Home"));
const Warranty = lazy(() => import("./pages/Warranty"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
//const Login = lazy(() => import("./pages/Login"));

const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Cart = lazy(() => import("./pages/Cart"));
export default function App() {
  return (
    <>
      <Navbar />
      <Breadcrumbs />

      <Suspense fallback={<div className="p-10">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* DEVICE / CATEGORY FLOW */}
          <Route path="/:group/:type" element={<CatalogPage />} />
          <Route path="/:group/:type/:brand" element={<BrandPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* Static pages */}
          <Route path="/about" element={<About />} />
          <Route path="/faq/:item" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected */}
          <Route
            path="/warranty"
            element={
              <ProtectedRoute>
                <Warranty />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
              <Route path="*" element={<div>Page Not Found</div>} />
            <Route path="/products" element={<Products />} />
<Route
  path="/admin"
  element={
    <AdminRoute>
      <Admin />
    </AdminRoute>
  }
/>

<Route
  path="/admin/orders"
  element={
    <AdminRoute>
      <AdminOrders />
    </AdminRoute>
  }
/>


          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-10 text-xl">Page Not Found</div>}
          />
        </Routes>
      </Suspense>
    </>
  );
}
