import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { API_BASE } from "../lib/api";

export default function CatalogPage() {
  const { group, type } = useParams(); // device/category + smartphones/audio
  const navigate = useNavigate();
  const [brands, setBrands] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        const findKey = (obj, key) =>
          Object.keys(obj || {}).find(
            (k) => k.toLowerCase() === key.toLowerCase()
          );
        const groupKey = findKey(data, group);
        const typeKey = findKey(data?.[groupKey], type);
        setBrands(data?.[groupKey]?.[typeKey] || {});
      });
  }, [group, type]);

  const title = `${type.toUpperCase()} | ${group.toUpperCase()} | CELL`;

  return (
    <div className="max-w-6xl mx-auto p-10">
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={`Browse ${type} brands under ${group} at CELL`}
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {type}
      </h1>

      {Object.keys(brands).length === 0 && (
        <div className="card p-4 text-sm text-gray-600">
          No brands found for this category. Try{" "}
          <span
            className="text-teal-700 cursor-pointer"
            onClick={() => navigate("/products")}
          >
            browsing all products
          </span>
          .
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {Object.keys(brands).map((brand) => (
          <div
            key={brand}
            onClick={() =>
              navigate(`/${group}/${type}/${brand.toLowerCase()}`)
            }
            className="border p-6 rounded-lg text-center cursor-pointer hover:shadow-lg"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
}
