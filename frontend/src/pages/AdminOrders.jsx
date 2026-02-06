import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminOrders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);

  // 🔐 Auth guard
  if (!user) return <div className="p-10">Loading...</div>;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  // 📥 Fetch all orders
 useEffect(() => {
  fetch("http://localhost:5000/api/admin/orders/all", {
    headers: { Authorization: token },
  })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    });
}, []);
  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Admin – Orders</h1>

      {orders.map(order => (
        <div key={order._id} className="border p-4 mb-4">
          <p className="font-semibold">Order ID: {order._id}</p>
          <p>User: {order.userId}</p>

          {/* ✅ THIS IS WHERE YOUR <select> GOES */}
         <select
  value={order.status}
  onChange={(e) =>
    fetch(`http://localhost:5000/api/admin/orders/${order._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ status: e.target.value }),
    })
  }
>
  <option value="placed">Placed</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option>
</select>

        </div>
      ))}
    </div>
  );
}
