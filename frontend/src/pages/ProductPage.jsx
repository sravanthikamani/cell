import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ImageGallery from "../components/ImageGallery";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";
import { Heart, ShoppingCart, Star, StarHalf } from "lucide-react";
import { normalizeColorName, resolveColorSwatch } from "../lib/colors";

export default function ProductPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const { t, lang } = useI18n();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [realImages, setRealImages] = useState([]);
  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productDetailsBg =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772629203/drew-beamer-kUHfMW8awpE-unsplash_aqbeir.jpg";
  const reviewFileInputRef = useRef(null);

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

  if (!product) {
    return (
      <div className="p-10">
        <Seo
          title="Product Details"
          description="View product details, reviews, and buying options at HI-TECH."
          canonicalPath={`/product/${id}`}
          type="product"
        />
        {t("Loading...")}
      </div>
    );
  }

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

    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id || user._id,
        productId: product._id,
        variant: { size: selectedSize, color: selectedColor },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || t("Failed to add to cart"));
      return;
    }

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
      const isEditing = Boolean(editingReviewId);
      const url = isEditing
        ? `${API_BASE}/api/reviews/${editingReviewId}`
        : `${API_BASE}/api/reviews`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(isEditing ? {} : { productId: product._id }),
          rating: Number(rating),
          comment,
          realImages,
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
      setRealImages([]);
      setEditingReviewId("");
      setReviewMsg("");
    } catch (err) {
      setReviewMsg(err.error || t("Failed to submit review."));
    }
  };

  const uploadReviewImage = async (file) => {
    if (!file || !user) return;
    setReviewMsg("");
    setIsUploadingReviewImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/reviews/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }
      setRealImages((prev) => [...prev, data.url].slice(0, 5));
    } catch (err) {
      setReviewMsg(err.message || "Failed to upload image");
    } finally {
      setIsUploadingReviewImage(false);
    }
  };

  const onEditReview = (review) => {
    setEditingReviewId(review._id);
    setRating(Number(review.rating || 5));
    setComment(review.comment || "");
    setRealImages(Array.isArray(review.realImages) ? review.realImages : []);
    setReviewMsg("");
  };

  const onDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      if (editingReviewId === reviewId) {
        setEditingReviewId("");
        setRating(5);
        setComment("");
        setRealImages([]);
      }
      setReviewMsg("");
    } catch (err) {
      setReviewMsg(err.message || "Failed to delete review");
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
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

  const specificationRows = [
    ...(product?.specs && typeof product.specs === "object"
      ? Object.entries(product.specs)
          .map(([feature, value]) => ({
            feature: String(feature || "").trim(),
            value: String(value || "").trim(),
          }))
          .filter((row) => row.feature && row.value)
      : []),
  ];

  const fallbackSpecs = [
    { feature: "Display", value: product.display },
    { feature: "Processor", value: product.processor },
    { feature: "RAM", value: product.ram },
    { feature: "Storage", value: product.storage },
    { feature: "Camera", value: product.camera },
    { feature: "Battery", value: product.battery },
    { feature: "OS", value: product.os },
  ];

  const finalSpecificationRows = specificationRows.length ? specificationRows : fallbackSpecs;

  const colorImageMap = (product?.colorImageMap && typeof product.colorImageMap === "object")
    ? product.colorImageMap
    : {};

  const getColorImage = (colorName = "") => {
    if (!colorName) return "";
    const exact = colorImageMap[colorName];
    if (exact) return exact;
    const normalizedTarget = normalizeColorName(colorName);
    const matchKey = Object.keys(colorImageMap).find(
      (k) => normalizeColorName(k) === normalizedTarget
    );
    if (matchKey) return colorImageMap[matchKey];

    const colorIndex = Array.isArray(product.colors)
      ? product.colors.findIndex((c) => normalizeColorName(c) === normalizedTarget)
      : -1;
    if (colorIndex >= 0 && Array.isArray(product.images) && product.images[colorIndex]) {
      return product.images[colorIndex];
    }

    return "";
  };

  const selectedColorImage = getColorImage(selectedColor);
  const galleryImages = selectedColorImage
    ? [selectedColorImage, ...(product.images || []).filter((img) => img !== selectedColorImage)]
    : (product.images || []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${productDetailsBg})` }}
    >
      <div className="max-w-5xl mx-auto p-6 md:p-10">
      <Seo
        title={product.name || "Product Details"}
        description={
          product.seoDescription ||
          `${product.brand || "Electronics"} product details, stock, reviews, and pricing.`
        }
        canonicalPath={`/product/${id}`}
        type="product"
        keywords={`${product.brand || ""}, ${product.name || ""}, electronics product`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 🖼 IMAGE GALLERY + ZOOM */}
        <div className="card p-4">
          <ImageGallery images={galleryImages} />
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
          {(product.longDescription || product.description) && (
            <p className="mt-3 text-sm leading-6 text-gray-700">
              {product.longDescription || product.description}
            </p>
          )}

          {(product.colors?.length > 0 || product.sizes?.length > 0) && (
            <div className="mt-4 flex gap-4">
              {product.colors?.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  {product.colors.map((c) => {
                    const active = selectedColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                          active ? "border-slate-800 bg-slate-100" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        title={c}
                        aria-label={`Select color ${c}`}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: resolveColorSwatch(c) }}
                        />
                        {c}
                      </button>
                    );
                  })}
                </div>
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
              className="inline-flex items-center justify-center rounded-full p-2 btn-primary disabled:opacity-50"
              disabled={product.stock <= 0}
              aria-label={t("Add to Cart")}
              title={t("Add to Cart")}
            >
              <ShoppingCart size={18} />
            </button>
            <button
              onClick={toggleWishlist}
              className="inline-flex items-center justify-center rounded-full p-2 btn-secondary"
              aria-label={isWishlisted ? t("Remove Wishlist") : t("Add to Wishlist")}
              title={isWishlisted ? t("Remove Wishlist") : t("Add to Wishlist")}
            >
              <Heart
                size={18}
                className={isWishlisted ? "fill-current text-red-500" : "text-current"}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900/95 text-slate-100 p-4 md:p-6 shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Specifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-slate-100">
                <th className="text-left font-semibold py-3 pr-4">Feature</th>
                <th className="text-left font-semibold py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {finalSpecificationRows.map((row) => (
                <tr key={row.feature} className="border-b border-slate-800/90 last:border-b-0">
                  <td className="py-3 pr-4 text-slate-100">{row.feature}</td>
                  <td className="py-3 text-slate-200">{row.value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 card p-6">
        <h2 className="text-2xl font-bold mb-4">{t("Reviews")}</h2>

        <div className="border rounded p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm">{t("Rating:")}</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border px-2 py-1"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={3.5}>3.5</option>
              <option value={4}>4</option>
              <option value={4.5}>4.5</option>
              <option value={5}>5</option>
            </select>
            <StarsRow value={Number(rating)} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border w-full mt-3 p-2"
            placeholder={t("Write your review...")}
            rows={3}
          />
          <div className="mt-3">
            <input
              ref={reviewFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                await uploadReviewImage(file);
              }}
              disabled={isUploadingReviewImage || realImages.length >= 5}
            />
            <button
              type="button"
              className="border px-3 py-1"
              onClick={() => reviewFileInputRef.current?.click()}
              disabled={isUploadingReviewImage || realImages.length >= 5}
            >
              Choose file
            </button>
            <div className="text-xs text-gray-500 mt-1">Up to 5 images</div>
            {isUploadingReviewImage && (
              <div className="text-xs text-gray-600 mt-1">Uploading image...</div>
            )}
            {realImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {realImages.map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative">
                    <img
                      src={resolveImageUrl(img)}
                      alt={`real-${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
                      onClick={() =>
                        setRealImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {reviewMsg && (
            <div className="mt-2 text-sm text-red-600">
              {reviewMsg}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={submitReview}
              className="btn-primary"
            >
              {editingReviewId ? "Update Review" : t("Submit Review")}
            </button>
            {editingReviewId && (
              <button
                type="button"
                onClick={() => {
                  setEditingReviewId("");
                  setRating(5);
                  setComment("");
                  setRealImages([]);
                  setReviewMsg("");
                }}
                className="border px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
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
            {Array.isArray(r.realImages) && r.realImages.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {r.realImages.map((img, idx) => (
                    <img
                      key={`${r._id}-${idx}`}
                      src={resolveImageUrl(img)}
                      alt={`review-${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
            {String(r.userId?._id || "") === String(user?.id || "") && (
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => onEditReview(r)} className="text-blue-600 underline">
                  {t("Edit")}
                </button>
                <button type="button" onClick={() => onDeleteReview(r._id)} className="text-red-600 underline">
                  {t("Delete")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function StarsRow({ value = 0, size = 16 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(
        <Star key={i} size={size} className="text-yellow-400" />
      );
    } else if (value >= i - 0.5) {
      stars.push(
        <StarHalf key={i} size={size} className="text-yellow-400" />
      );
    } else {
      stars.push(
        <Star key={i} size={size} className="text-slate-400" />
      );
    }
  }
  return <div className="flex items-center gap-1">{stars}</div>;
}
