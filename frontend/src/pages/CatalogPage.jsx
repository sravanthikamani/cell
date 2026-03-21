import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Seo from "../components/Seo";

export default function CatalogPage() {
    const backAccentColor = "#77ea2f";
  const { group, type } = useParams(); // device/category + smartphones/audio
  const navigate = useNavigate();
  const [brands, setBrands] = useState({});
  const { t } = useI18n();
  const normalizeSegment = (value = "") =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        const findKey = (obj, key) =>
          Object.keys(obj || {}).find(
            (k) => normalizeSegment(k) === normalizeSegment(key)
          );
        const groupKey = findKey(data, group);
        const typeKey = findKey(data?.[groupKey], type);
        setBrands(data?.[groupKey]?.[typeKey] || {});
      });
  }, [group, type]);

  const title = `${t(type || "").toUpperCase()} | ${t(group || "").toUpperCase()} | HI-TECH`;

  return (
    <div className="max-w-6xl mx-auto p-10">
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
        <span className="product-back-wave" style={{ animationDelay: "0.12s" }}>{t("Back")}</span>
      </button>
      <Seo
        title={title}
        description={`${t("Browse all products")}: ${t(type)} / ${t(group)} | HI-TECH`}
        canonicalPath={`/${normalizeSegment(group)}/${normalizeSegment(type)}`}
      />

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {t(type)}
      </h1>

      {Object.keys(brands).length === 0 && (
        <div className="card p-4 text-sm text-gray-600">
          {t("No brands found for this category. Try browsing all products.")}
          {" "}
          <span
            className="text-teal-700 cursor-pointer"
            onClick={() => navigate("/products")}
          >
            {t("Browse all products")}
          </span>
          .
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {Object.keys(brands).map((brand) => (
          <div
            key={brand}
            onClick={() =>
              navigate(
                `/${normalizeSegment(group)}/${normalizeSegment(type)}/${normalizeSegment(
                  brand
                )}`
              )
            }
            className="border p-6 rounded-lg text-center cursor-pointer hover:shadow-lg"
          >
            {t(brand)}
          </div>
        ))}
      </div>
    </div>
  );
}
