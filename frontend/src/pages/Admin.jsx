import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user, token } = useAuth();

  if (!user) return <div className="p-10">Loading...</div>;
  if (user.role !== "admin") return <Navigate to="/" replace />;
const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    brand: "",
    group: "",
    type: "",
    images: "",
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/catalog")
      .then(res => res.json())
      .then(data => {
        const list = [];
        Object.values(data).forEach(g =>
          Object.values(g).forEach(t =>
            Object.values(t).forEach(b =>
              b.forEach(p => list.push(p))
            )
          )
        );
        setProducts(list);
      });
  }, []);

  const addProduct = async () => {
  const res = await fetch("http://localhost:5000/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      ...form,
      price: Number(form.price),
      images: form.images.split(",").map(i => i.trim()),
    }),
  });

  const data = await res.json(); // ✅ THIS WAS MISSING
  console.log("Added product:", data);

  alert("Product added");
};

const updateProduct = async () => {
  await fetch(
    `http://localhost:5000/api/admin/products/${editingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        images: form.images.split(",").map(i => i.trim()),
      }),
    }
  );

  alert("Product updated");
  setEditingId(null);
};

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Admin – Add Product</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key}
          className="w-full border p-2 mb-3"
          value={form[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
        />
      ))}

    <button
  onClick={editingId ? updateProduct : addProduct}
  className="w-full bg-black text-white py-2"
>
  {editingId ? "Update Product" : "Add Product"}
</button>


      <h2 className="text-xl font-bold mt-10">All Products</h2>

    {products.map(p => (
  <div
    key={p._id}
    className="flex justify-between items-center border p-2 mt-2"
  >
    <span>{p.name}</span>

    <div className="flex gap-4">
      {/* ✏️ EDIT BUTTON */}
      <button
        onClick={() => {
          setEditingId(p._id);
          setForm({
            name: p.name,
            price: p.price,
            brand: p.brand,
            group: p.group,
            type: p.type,
            images: p.images.join(","),
          });
        }}
        className="text-blue-600"
      >
        Edit
      </button>

      {/* 🗑 DELETE BUTTON */}
      <button
        onClick={() =>
          fetch(`http://localhost:5000/api/admin/products/${p._id}`, {
            method: "DELETE",
            headers: { Authorization: token },
          }).then(() =>
            setProducts(products.filter(x => x._id !== p._id))
          )
        }
        className="text-red-600"
      >
        Delete
      </button>
    </div>
  </div>
))}

    </div>
  );
}
