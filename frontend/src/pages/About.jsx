import { Helmet } from "react-helmet-async";
import { useI18n } from "../context/I18nContext";

export default function About() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto p-10">
      <Helmet>
        <title>{t("About Us")} | HI-TECH</title>
        <meta
          name="description"
          content={t("About Us")}
        />
      </Helmet>

      <h1 className="text-4xl font-bold mb-4 text-teal-600">
        {t("About Us")}
      </h1>
      <p className="text-gray-600 leading-relaxed">
        {t(
          "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust."
        )}
      </p>
    </div>
  );
}
