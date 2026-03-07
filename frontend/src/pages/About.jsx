import { useEffect } from "react";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";

export default function About() {
  const { t } = useI18n();

  useEffect(() => {
    document.body.classList.add("about-bg-active");
    return () => {
      document.body.classList.remove("about-bg-active");
    };
  }, []);

  return (
    <div className="about-page-bg">
      <div className="max-w-5xl mx-auto p-10">
      <Seo
        title={t("About Us")}
        description={t(
          "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust."
        )}
        canonicalPath="/about"
      />

      <h1 className="text-4xl font-extrabold mb-4 text-blue-900">
        {t("About Us")}
      </h1>
      <p className="text-blue-900 font-bold leading-relaxed">
        {t(
          "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust."
        )}
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <img
          src="/images/about-1.jpeg"
          alt="About HI-TECH 1"
          className="w-full h-64 md:h-80 object-cover rounded-2xl"
          loading="lazy"
        />
        <img
          src="/images/about-2.jpeg"
          alt="About HI-TECH 2"
          className="w-full h-64 md:h-80 object-cover rounded-2xl"
          loading="lazy"
        />
        <img
          src="/images/about-3.jpeg"
          alt="About HI-TECH 3"
          className="w-full h-64 md:h-80 object-cover rounded-2xl"
          loading="lazy"
        />
      </div>
      </div>
    </div>
  );
}
