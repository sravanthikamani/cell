import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";

export default function Warranty() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto p-10">
      <Seo
        title="Warranty Policy"
        description="Read HI-TECH warranty policy, coverage details, and support information."
        canonicalPath="/warranty"
      />

      <h1 className="text-4xl font-bold mb-4 text-teal-600">
        {t("Warranty Policy")}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <img
          src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772630903/ChatGPT_Image_Mar_4_2026_06_54_20_PM_hjxf9p.png"
          alt="Warranty detail 1"
          className="w-full h-56 object-cover rounded-lg"
        />
        <img
          src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772631184/ChatGPT_Image_Mar_4_2026_06_55_37_PM_na81nk.png"
          alt="Warranty detail 2"
          className="w-full h-56 object-cover rounded-lg"
        />
        <img
          src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772631205/ChatGPT_Image_Mar_4_2026_06_58_02_PM_tvkncm.png"
          alt="Warranty detail 3"
          className="w-full h-56 object-cover rounded-lg"
        />
      </div>
    </div>
  );
}
