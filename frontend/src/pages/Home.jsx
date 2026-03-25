import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../lib/format";
import Seo from "../components/Seo";

export default function Home() {
  const homeBg = "/images/homebg.jpg";
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
  const offerIconTypes = ["phone", "headphones", "watch", "charger", "tablet", "earbuds"];
  const offerIcons = Array.from({ length: 26 }, (_, i) => ({
    type: offerIconTypes[i % offerIconTypes.length],
    left: `${6 + ((i * 9) % 88)}%`,
    top: `${10 + ((i * 17) % 78)}%`,
    delay: `${(i * 0.27).toFixed(2)}s`,
    dur: `${(3.4 + (i % 5) * 0.45).toFixed(2)}s`,
    size: `${14 + (i % 5) * 2}px`,
  }));
  const [featured, setFeatured] = useState([]);
  const [activeOfferInfo, setActiveOfferInfo] = useState(null);
  const [offerNowTs, setOfferNowTs] = useState(() => Date.now());
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [isNotifySubmitting, setIsNotifySubmitting] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/offers/active`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.active && data?.offer) {
          setActiveOfferInfo({
            title: data.offer.title,
            startsAt: data.offer.startsAt,
            endsAt: data.offer.endsAt,
          });
        } else {
          setActiveOfferInfo(null);
        }
      })
      .catch(() => {
        if (!cancelled) setActiveOfferInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeOfferInfo?.endsAt) return undefined;
    const timer = setInterval(() => setOfferNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeOfferInfo?.endsAt]);

  const offerTimeLeft = (() => {
    if (!activeOfferInfo?.endsAt) return "";
    const leftMs = new Date(activeOfferInfo.endsAt).getTime() - offerNowTs;
    if (leftMs <= 0) return "Offer expired";
    const sec = Math.floor(leftMs / 1000);
    const d = Math.floor(sec / (24 * 3600));
    const h = Math.floor((sec % (24 * 3600)) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s left`;
    if (h > 0) return `${h}h ${m}m ${s}s left`;
    return `${m}m ${s}s left`;
  })();

  const renderOfferIcon = (type) => {
    switch (type) {
      case "phone":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="2.5" width="10" height="19" rx="2.3" ry="2.3" />
            <line x1="10" y1="5" x2="14" y2="5" />
            <circle cx="12" cy="18.4" r="0.9" />
          </svg>
        );
      case "headphones":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 13a7 7 0 0 1 14 0" />
            <rect x="4" y="12" width="4" height="7" rx="1.2" />
            <rect x="16" y="12" width="4" height="7" rx="1.2" />
          </svg>
        );
      case "watch":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="1.7" width="6" height="3.4" rx="1" />
            <rect x="7" y="5.2" width="10" height="13.6" rx="2" />
            <rect x="9" y="18.8" width="6" height="3.5" rx="1" />
            <circle cx="12" cy="12" r="2.7" />
          </svg>
        );
      case "charger":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6h6v6H9z" />
            <line x1="10.5" y1="3.5" x2="10.5" y2="6" />
            <line x1="13.5" y1="3.5" x2="13.5" y2="6" />
            <path d="M12 12v3.5c0 2.2-1.8 4-4 4H6.5" />
          </svg>
        );
      case "tablet":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="3.2" width="14" height="17.6" rx="2" />
            <circle cx="12" cy="17.6" r="0.85" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 7c0-1.8 1.5-3.3 3.3-3.3H12v7.2H9.8A1.8 1.8 0 0 1 8 9.1V7z" />
            <path d="M16 7c0-1.8-1.5-3.3-3.3-3.3H12v7.2h2.2A1.8 1.8 0 0 0 16 9.1V7z" />
            <path d="M12 10.8v7.4" />
          </svg>
        );
    }
  };

  const handleNotifySubmit = async () => {
    const email = notifyEmail.trim();
    if (!email) {
      setNotifyMessage(t("Please enter your email."));
      return;
    }

    try {
      setIsNotifySubmitting(true);
      setNotifyMessage("");

      const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNotifyMessage(data?.error || t("Failed to subscribe. Please try again."));
        return;
      }

      setNotifyMessage(
        data?.alreadySubscribed
          ? t("This email is already subscribed.")
          : t("Thanks for subscribing. Please check your email.")
      );
      if (!data?.alreadySubscribed) {
        setNotifyEmail("");
      }
    } catch {
      setNotifyMessage(t("Failed to subscribe. Please try again."));
    } finally {
      setIsNotifySubmitting(false);
    }
  };

  return (
    <div>
      <Seo
        title="HI-TECH Electronics Store"
        description="Shop smartphones, audio devices, accessories, and more with secure checkout and fast delivery."
        canonicalPath="/"
        keywords="electronics, smartphones, accessories, audio, tablets"
      />

      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-cover bg-center text-white p-5 sm:p-8 md:p-14"
        style={{
          backgroundImage:
            `linear-gradient(135deg, rgba(30,58,138,0.88), rgba(15,23,42,0.95)), url('${homeBg}')`,
        }}
      >
        <div className="max-w-2xl text-center sm:text-left">
          <p className="uppercase tracking-widest text-xs text-blue-100 mb-2">
            {t("New Season Tech")}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">
            {t("Power your day with devices that feel futuristic")}
          </h1>
          <p className="mt-4 text-blue-100 text-sm md:text-base">
            {t(
              "Flagship phones, premium audio, and smart accessories curated for everyday performance."
            )}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link to="/products" className="btn-primary w-full sm:w-auto text-center">
              {t("Shop All")}
            </Link>
            <Link
              to="/device/smartphones"
              className="btn-secondary w-full sm:w-auto text-center"
            >
              {t("Explore Phones")}
            </Link>
          </div>
        </div>
        <div className="absolute hidden sm:block -right-20 -bottom-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute hidden sm:block right-10 top-8 w-24 h-24 bg-orange-400/80 rounded-full blur-xl" />
      </div>

      {/* Exclusive offers */}
      <Link
        to="/offers"
        className="mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white exclusive-offers-section relative overflow-hidden min-h-[260px] sm:min-h-[310px] md:min-h-[350px] flex items-center"
      >
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
        <div className="offer-icons-layer" aria-hidden="true">
          {offerIcons.map((icon, idx) => (
            <span
              key={`${icon.type}-${idx}`}
              className="offer-float-icon"
              style={{
                left: icon.left,
                top: icon.top,
                "--icon-delay": icon.delay,
                "--icon-dur": icon.dur,
                "--icon-size": icon.size,
              }}
            >
              {renderOfferIcon(icon.type)}
            </span>
          ))}
        </div>
        <h1 className="grand-sale" aria-hidden="true">
          <span>GRAND</span>
          <span>SALE</span>
        </h1>
        <div className="relative z-10 w-full sm:max-w-2xl sm:ml-auto text-right rounded-xl sm:rounded-2xl bg-black/28 sm:bg-black/18 backdrop-blur-[1px] p-3 sm:p-4 md:p-5">
          <p className="offer-copy mt-1 text-white/95">
            {activeOfferInfo ? (
              <>
                <span className="block">{activeOfferInfo.title || "Special offer is live"}</span>
                <span className="block mt-2">
                  <span className="offer-date">
                    {new Date(activeOfferInfo.startsAt).toLocaleDateString()}
                  </span>{" "}
                  to{" "}
                  <span className="offer-date">
                    {new Date(activeOfferInfo.endsAt).toLocaleDateString()}
                  </span>
                </span>
                <span className="block mt-2 text-sm font-semibold">{offerTimeLeft}</span>
              </>
            ) : (
              <>
                <span className="block">Upcoming offers start from</span>
                <span className="block mt-2">
                  <span className="offer-date">March 1st</span> to <span className="offer-date">March 31st</span>
                </span>
              </>
            )}
          </p>
        </div>
      </Link>

      {/* Featured */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">{t("Featured Products")}</h2>
          <Link to="/products" className="btn-primary text-sm !px-4 !py-2 w-full sm:w-auto text-center">
            {t("View all")}
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                srcSet={p.images?.[0] ? `${p.images?.[0]} 400w, ${p.images?.[0]} 800w` : undefined}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={p.name}
                className="h-40 sm:h-44 w-full object-cover rounded-xl"
                width="320"
                height="176"
                loading="lazy"
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
      <div className="mt-12 rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-6 sm:p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">{t("Get early access deals")}</h3>
            <p className="text-sm text-slate-300 mt-2">
              {t(
                "Sign up to receive launches, price drops, and exclusive offers."
              )}
            </p>
          </div>
          <div className="mt-1 md:mt-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!isNotifySubmitting) {
                    handleNotifySubmit();
                  }
                }
              }}
              placeholder={t("Your email")}
              className="w-full sm:flex-1 md:w-64 rounded-full px-4 py-2 text-slate-900"
            />
            <button
              type="button"
              onClick={handleNotifySubmit}
              disabled={isNotifySubmitting}
              className="btn-primary w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isNotifySubmitting ? t("Processing...") : t("Notify me")}
            </button>
          </div>
        </div>
        {notifyMessage ? (
          <p className="mt-4 text-sm text-slate-200">{notifyMessage}</p>
        ) : null}
      </div>
      </div>
    </div>
  );
}
