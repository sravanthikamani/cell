import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import Seo from "../components/Seo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";

export default function CategoryPage() {
    const backAccentColor = "#77ea2f";
  const { type } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/products/search?group=category&type=${encodeURIComponent(type)}`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        // Extract unique brands (case-insensitive, but show as-is)
        const brandSet = new Map();
        (Array.isArray(data) ? data : []).forEach(p => {
          if (p.brand) brandSet.set(p.brand.toLowerCase(), p.brand);
        });
        setBrands(Array.from(brandSet.values()));
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load brands");
        setLoading(false);
      });
  }, [type]);
  return (
    <div key={type} className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-1 py-1 text-lg md:text-xl font-semibold transition hover:opacity-80"
          style={{ color: backAccentColor }}
          aria-label="Back"
        >
          <span className="product-back-wave inline-flex items-center justify-center">
            <FontAwesomeIcon icon={faBackward} className="text-xl md:text-2xl" />
          </span>
          <span className="product-back-wave" style={{ animationDelay: "0.12s" }}>{type === "product" ? t("Back") : t("Back")}</span>
        </button>
        <Seo title={`Category: ${type}`} description={`Browse all products in category: ${type}.`} />
        <h1 className="text-3xl font-bold mb-6 capitalize">{type}</h1>
        {loading && <p>Loading brands...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && brands.length === 0 && <p>No brands found.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {brands.map(brand => (
            <button
              key={brand}
              className="border rounded-lg p-6 text-lg font-semibold hover:shadow-lg transition"
              onClick={() => navigate(`/category/${type}/${brand}`)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
