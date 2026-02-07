import { useI18n } from "../context/I18nContext";

export default function Warranty() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4 text-teal-600">
        {t("Warranty Policy")}
      </h1>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li>{t("1 year manufacturer warranty")}</li>
        <li>{t("Covers hardware defects")}</li>
        <li>{t("Does not cover physical damage")}</li>
      </ul>
    </div>
  );
}
