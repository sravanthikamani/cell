import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";

export default function Home() {
  const homeBg =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772698018/chris-appano--sTwytNnqWw-unsplash_itlmtf.jpg";
  const confettiColors = ["#fde047", "#fb7185", "#60a5fa", "#34d399", "#f97316", "#a78bfa", "#22d3ee", "#facc15"];
  const confettiPieces = Array.from({ length: 24 }, (_, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    return {
      left: `${4 + ((i * 4) % 92)}%`,
      tx: `${direction * (90 + (i % 6) * 45)}px`,
      ty: `-${170 + (i % 5) * 30}px`,
      delay: `${(i * 0.13).toFixed(2)}s`,
      dur: `${(2.35 + (i % 7) * 0.18).toFixed(2)}s`,
      color: confettiColors[i % confettiColors.length],
    };
  });
  const heartDrops = Array.from({ length: 14 }, (_, i) => ({
    left: `${5 + ((i * 7) % 90)}%`,
    delay: `${(i * 0.35).toFixed(2)}s`,
    dur: `${(4.2 + (i % 5) * 0.45).toFixed(2)}s`,
    size: `${14 + (i % 4) * 4}px`,
  }));
  const balloons = Array.from({ length: 10 }, (_, i) => ({
    left: `${6 + ((i * 9) % 86)}%`,
    delay: `${(i * 0.55).toFixed(2)}s`,
    dur: `${(6.8 + (i % 4) * 0.7).toFixed(2)}s`,
    size: `${20 + (i % 3) * 6}px`,
    color: ["#f43f5e", "#38bdf8", "#f59e0b", "#34d399", "#a78bfa"][i % 5],
  }));
  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    left: `${4 + ((i * 11) % 92)}%`,
    top: `${8 + ((i * 13) % 74)}%`,
    delay: `${(i * 0.22).toFixed(2)}s`,
    dur: `${(1.4 + (i % 6) * 0.28).toFixed(2)}s`,
    size: `${4 + (i % 4)}px`,
  }));
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
      <div className="mt-10 rounded-3xl p-6 md:p-8 text-white exclusive-offers-section relative overflow-hidden min-h-[310px] md:min-h-[350px] flex items-center">
        <img
          src="/images/sale images/grandsalelimit.jpg"
          alt="Exclusive offers"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/35" />
        <div className="firework firework-left" aria-hidden="true">
          <span className="blast-core" />
          <span className="blast-cone" />
          <span className="spark spark-1" />
          <span className="spark spark-2" />
          <span className="spark spark-3" />
          <span className="spark spark-4" />
          <span className="spark spark-5" />
          <span className="spark spark-6" />
          <span className="spark spark-7" />
          <span className="spark spark-8" />
        </div>
        <div className="firework firework-right" aria-hidden="true">
          <span className="blast-core" />
          <span className="blast-cone" />
          <span className="spark spark-1" />
          <span className="spark spark-2" />
          <span className="spark spark-3" />
          <span className="spark spark-4" />
          <span className="spark spark-5" />
          <span className="spark spark-6" />
          <span className="spark spark-7" />
          <span className="spark spark-8" />
        </div>
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map((piece, idx) => (
            <span
              key={`${piece.left}-${idx}`}
              className="confetti-piece"
              style={{
                left: piece.left,
                "--tx": piece.tx,
                "--ty": piece.ty,
                "--delay": piece.delay,
                "--dur": piece.dur,
                "--paper-color": piece.color,
              }}
            />
          ))}
        </div>
        <div className="hearts-layer" aria-hidden="true">
          {heartDrops.map((heart, idx) => (
            <span
              key={`${heart.left}-${idx}`}
              className="heart-drop"
              style={{
                left: heart.left,
                "--heart-delay": heart.delay,
                "--heart-dur": heart.dur,
                "--heart-size": heart.size,
              }}
            >
              ❤
            </span>
          ))}
        </div>
        <div className="balloons-layer" aria-hidden="true">
          {balloons.map((balloon, idx) => (
            <span
              key={`${balloon.left}-${idx}`}
              className="balloon-rise"
              style={{
                left: balloon.left,
                "--balloon-delay": balloon.delay,
                "--balloon-dur": balloon.dur,
                "--balloon-size": balloon.size,
                "--balloon-color": balloon.color,
              }}
            >
              <span className="balloon-string" />
            </span>
          ))}
        </div>
        <div className="sparkles-layer" aria-hidden="true">
          {sparkles.map((sparkle, idx) => (
            <span
              key={`${sparkle.left}-${sparkle.top}-${idx}`}
              className="sparkle-star"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                "--sparkle-delay": sparkle.delay,
                "--sparkle-dur": sparkle.dur,
                "--sparkle-size": sparkle.size,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-2xl ml-auto text-right rounded-2xl bg-black/18 backdrop-blur-[1px] p-4 md:p-5">
          <p className="offer-copy mt-1 text-white/95">
            <span className="block">Upcoming offers start from</span>
            <span className="block mt-2">
              <span className="offer-date">March 1st</span> to <span className="offer-date">March 31st</span>
            </span>
          </p>
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
