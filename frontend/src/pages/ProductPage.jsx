import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ImageGallery from "../components/ImageGallery";

export default function ProductPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState(null);

  // 🔹 Load single product
  useEffect(() => {
    fetch(`http://localhost:5000/api/product/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <div className="p-10">Loading...</div>;

  // 🔹 Add to cart from product page
  const addToCart = async () => {
    if (!user) {
      alert("Login first");
      return;
    }

    await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        userId: user.id,
        productId: product._id,
      }),
    });

    await refreshCart();
    alert("Added to cart");
  };

  return (
    <div className="max-w-4xl mx-auto p-10 grid grid-cols-2 gap-10">
      {/* 🖼 IMAGE GALLERY + ZOOM */}
      <ImageGallery images={product.images} />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl text-gray-600">₹{product.price}</p>

        <button
          onClick={addToCart}
          className="mt-6 bg-teal-600 text-white px-6 py-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
