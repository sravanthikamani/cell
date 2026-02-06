import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);

  // ✅ STOP until user exists
  if (!user) {
    return <div className="p-10">Loading orders...</div>;
  }

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${user.id}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, [user, token]);

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 mb-4"
        >
          <p className="font-semibold">
            Order ID: {order._id}
          </p>
          <p>Status: {order.status}</p>

          <div className="mt-2">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between text-sm"
              >
                <span>{item.productId.name}</span>
                <span>Qty: {item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
