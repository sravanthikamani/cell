import { useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";

export default function FAQ() {
  const { item } = useParams();
  const { t } = useI18n();
  const resolvedItem = String(item || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (
    <div className="p-10 text-2xl font-semibold">
      <Seo
        title={`${t("FAQ")} - ${t(item || "General")}`}
        description={`Frequently asked questions about ${t(item || "General")} at HI-TECH.`}
        canonicalPath={`/faq/${encodeURIComponent(resolvedItem || "general")}`}
      />

      {t("FAQ")}: {t(item)}
    </div>
  );
}
