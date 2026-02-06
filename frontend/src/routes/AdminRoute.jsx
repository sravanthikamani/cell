import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, token } = useAuth();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin access granted
  return children;
}
