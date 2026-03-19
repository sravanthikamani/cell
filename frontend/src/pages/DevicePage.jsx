import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Seo from "../components/Seo";

export default function DevicePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/products/search?group=device&type=${encodeURIComponent(type)}`)
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
        setError("Failed to load products");
        setLoading(false);
      });
  }, [type]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Seo title={`Device: ${type}`} description={`Browse all ${type} devices.`} />
      <h1 className="text-3xl font-bold mb-6 capitalize">{type}</h1>
      {loading && <p>Loading brands...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && brands.length === 0 && <p>No brands found.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {brands.map(brand => (
          <button
            key={brand}
            className="border rounded-lg p-6 text-lg font-semibold hover:shadow-lg transition"
            onClick={() => navigate(`/device/${type}/${brand}`)}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}
