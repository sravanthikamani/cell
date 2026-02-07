import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ImageGallery from "../components/ImageGallery";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";

export default function ProductPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const { t, lang } = useI18n();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 🔹 Load single product
  useEffect(() => {
    fetch(`${API_BASE}/api/product/${id}`)
      .then(res => res.json())
      .then((p) => {
        setProduct(p);
        setSelectedSize(p.sizes?.[0] || "");
        setSelectedColor(p.colors?.[0] || "");
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/${id}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!user || !token) return;
    fetch(`${API_BASE}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const exists = (data.products || []).some(
          (p) => p._id === id
        );
        setIsWishlisted(exists);
      })
      .catch(() => {});
  }, [id, user, token]);

  if (!product) return <div className="p-10">{t("Loading...")}</div>;

  // 🔹 Add to cart from product page
  const addToCart = async () => {
    if (!user) {
      alert(t("Login first"));
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert(t("Please select a color"));
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      alert(t("Please select a size"));
      return;
    }

    await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        productId: product._id,
        variant: { size: selectedSize, color: selectedColor },
      }),
    });

    await refreshCart();
    alert(t("Added to cart"));
  };

  const submitReview = async () => {
    if (!user) {
      setReviewMsg(t("Login first to leave a review."));
      return;
    }
    setReviewMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          rating: Number(rating),
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      const updated = [
        data,
        ...reviews.filter((r) => r._id !== data._id),
      ];
      setReviews(updated);
      setComment("");
      setRating(5);
      setReviewMsg(t("Review submitted."));
    } catch (err) {
      setReviewMsg(err.error || t("Failed to submit review."));
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert(t("Login first"));
      return;
    }
    const url = isWishlisted
      ? `${API_BASE}/api/wishlist/remove`
      : `${API_BASE}/api/wishlist/add`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product._id }),
    });
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event("wishlist:changed"));
  };

  const avgRating =
    reviews.length === 0
      ? 0
      : (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviews.length
        ).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 🖼 IMAGE GALLERY + ZOOM */}
        <div className="card p-4">
          <ImageGallery images={product.images} />
        </div>

        <div className="card p-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl text-gray-600 mt-1">
            {formatCurrency(product.price, lang)}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {t("Rating:")} {avgRating} / 5 ({reviews.length})
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {product.stock > 0
              ? t("Stock: {count}", { count: product.stock })
              : t("Out of stock")}
          </p>

          {(product.colors?.length > 0 || product.sizes?.length > 0) && (
            <div className="mt-4 flex gap-4">
              {product.colors?.length > 0 && (
                <select
                  className="border px-3 py-2 bg-white rounded"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  {product.colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              {product.sizes?.length > 0 && (
                <select
                  className="border px-3 py-2 bg-white rounded"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={addToCart}
              className="btn-primary disabled:opacity-50"
              disabled={product.stock <= 0}
            >
              {t("Add to Cart")}
            </button>
            <button onClick={toggleWishlist} className="btn-secondary">
              {isWishlisted ? t("Remove Wishlist") : t("Add to Wishlist")}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 card p-6">
        <h2 className="text-2xl font-bold mb-4">{t("Reviews")}</h2>

        <div className="border rounded p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm">{t("Rating:")}</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border w-full mt-3 p-2"
            placeholder={t("Write your review...")}
            rows={3}
          />
          {reviewMsg && (
            <div className="mt-2 text-sm text-red-600">
              {reviewMsg}
            </div>
          )}
          <button
            onClick={submitReview}
            className="mt-3 bg-teal-600 text-white px-4 py-2"
          >
            {t("Submit Review")}
          </button>
        </div>

        {reviews.length === 0 && (
          <p className="text-sm text-gray-600">{t("No reviews yet.")}</p>
        )}

        {reviews.map((r) => (
          <div key={r._id} className="border rounded p-4 mb-3">
            <div className="text-sm text-gray-700">
              {r.userId?.email || "User"}
            </div>
            <div className="text-sm">
              {t("Rating:")} {r.rating} / 5
            </div>
            {r.comment && (
              <div className="text-sm mt-2">{r.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
