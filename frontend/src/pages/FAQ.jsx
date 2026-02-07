import { useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function FAQ() {
  const { item } = useParams();
  const { t } = useI18n();

  return (
    <div className="p-10 text-2xl font-semibold">
      {t("FAQ")}: {t(item)}
    </div>
  );
}
