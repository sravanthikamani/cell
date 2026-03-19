// lib/user.js

export function getUserId(user) {
  return user?.id || user?._id;
}

export async function fetchCartCount(userId, token, API_BASE) {
  if (!userId || !token) return 0;
  const res = await fetch(`${API_BASE}/api/cart/${userId}`, {
    headers: { Authorization: token },
  });
  const cart = await res.json();
  return cart.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
}
