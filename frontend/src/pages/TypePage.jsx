import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";

export default function TypePage() {
    const backAccentColor = "#77ea2f";
  const { type } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState({});
  const { t } = useI18n();

  useEffect(() => {
   // fetch("http://localhost:5000/api/catalog")
      //.then(res => res.json())
      //.then(data => setBrands(data[type] || {}));
  }, [type]);

  return (
    <div className="p-10 max-w-6xl mx-auto">
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
        title={`${t(type).toUpperCase()} | HI-TECH`}
        description={`Explore ${t(type)} categories and brands at HI-TECH.`}
      />

      <h1 className="text-3xl font-bold mb-6 capitalize">{t(type)}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(brands).map((brand) => (
          <div
            key={brand}
            onClick={() => navigate(`/${type}/${brand.toLowerCase()}`)}
            className="border p-6 rounded-lg cursor-pointer hover:shadow-lg text-center"
          >
            {t(brand)}
          </div>
        ))}
      </div>
    </div>
  );
}
