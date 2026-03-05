import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";

export default function Home() {
  const homeBg = "/images/homebg.jpg";
  const [featured, setFeatured] = useState([]);
  const { t, lang } = useI18n();

  useEffect(() => {
    document.body.classList.add("home-bg-active");

    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        const list = [];
        Object.values(data).forEach((g) =>
          Object.values(g).forEach((t) =>
            Object.values(t).forEach((b) => b.forEach((p) => list.push(p)))
          )
        );
        setFeatured(list.slice(0, 6));
      })
      .catch(() => setFeatured([]));

    return () => {
      document.body.classList.remove("home-bg-active");
    };
  }, []);

  return (
    <div>
      <Seo
        title="HI-TECH Electronics Store"
        description="Shop smartphones, audio devices, accessories, and more with secure checkout and fast delivery."
        canonicalPath="/"
        keywords="electronics, smartphones, accessories, audio, tablets"
      />

      <div className="px-6 md:px-10 py-8">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl bg-cover bg-center text-white p-8 md:p-14"
        style={{
          backgroundImage:
            `linear-gradient(135deg, rgba(30,58,138,0.88), rgba(15,23,42,0.95)), url('${homeBg}')`,
        }}
      >
        <div className="max-w-2xl">
          <p className="uppercase tracking-widest text-xs text-blue-100 mb-2">
            {t("New Season Tech")}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {t("Power your day with devices that feel futuristic")}
          </h1>
          <p className="mt-4 text-blue-100 text-sm md:text-base">
            {t(
              "Flagship phones, premium audio, and smart accessories curated for everyday performance."
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/products" className="btn-primary">
              {t("Shop All")}
            </Link>
            <Link
              to="/device/smartphones"
              className="btn-secondary"
            >
              {t("Explore Phones")}
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute right-10 top-8 w-24 h-24 bg-orange-400/80 rounded-full blur-xl" />
      </div>

      {/* Exclusive offers */}
      <div className="mt-10 rounded-3xl bg-white/70 backdrop-blur-sm p-6 md:p-8 exclusive-offers-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-bold">{t("Exclusive Offers")}</h2>
            <p className="mt-2">
              {t("Upcoming offers start from")}{" "}
              <span className="offer-date">March 1st</span>{" "}
              {t("to")}{" "}
              <span className="offer-date">March 31st</span>
            </p>
          </div>
          <div className="md:justify-self-end">
            <img
              src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772683317/ChatGPT_Image_Mar_5_2026_09_30_19_AM_mlrgjg.png"
              alt={t("Exclusive offers banner")}
              className="w-full md:w-[460px] rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("Featured Products")}</h2>
          <Link to="/products" className="btn-primary text-sm !px-4 !py-2">
            {t("View all")}
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="card p-4"
            >
              <img
                src={
                  p.images?.[0]?.startsWith("/uploads")
                    ? `${API_BASE}${p.images?.[0]}`
                    : p.images?.[0]
                }
                alt={p.name}
                className="h-44 w-full object-cover rounded-xl"
              />
              <div className="mt-3">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(p.price, lang)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: t("Fast Shipping"),
            desc: t("Reliable delivery with tracking on every order."),
          },
          {
            title: t("Secure Payments"),
            desc: t("Stripe-powered checkout with full encryption."),
          },
          {
            title: t("Quality Promise"),
            desc: t("Curated gadgets with verified quality checks."),
          },
        ].map((v) => (
          <div key={v.title} className="card p-5">
            <div className="font-semibold">{v.title}</div>
            <div className="text-sm text-gray-600 mt-2">{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mt-12 rounded-3xl bg-slate-900 text-white p-8 md:p-12">
        <div className="md:flex items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">{t("Get early access deals")}</h3>
            <p className="text-sm text-slate-300 mt-2">
              {t(
                "Sign up to receive launches, price drops, and exclusive offers."
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2 w-full md:w-auto">
            <input
              placeholder={t("Your email")}
              className="flex-1 md:w-64 rounded-full px-4 py-2 text-slate-900"
            />
            <button className="btn-primary">
              {t("Notify me")}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
