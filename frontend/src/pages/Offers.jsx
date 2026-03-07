import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { API_BASE } from "../lib/api";
import { formatCurrency } from "../lib/format";

export default function Offers() {
  const [activeOffer, setActiveOffer] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/offers/active`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.active && data?.offer?.products?.length) {
          setActiveOffer(data.offer);
        } else {
          setActiveOffer(null);
        }
      })
      .catch(() => {
        if (!cancelled) setActiveOffer(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeOffer?.endsAt) return undefined;
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [activeOffer?.endsAt]);

  const timeLeftLabel = useMemo(() => {
    if (!activeOffer?.endsAt) return "";
    const leftMs = new Date(activeOffer.endsAt).getTime() - nowTs;
    if (leftMs <= 0) return "Offer expired";

    const totalSecs = Math.floor(leftMs / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) return `${days}d ${hours}h ${mins}m ${secs}s left`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s left`;
    return `${mins}m ${secs}s left`;
  }, [activeOffer?.endsAt, nowTs]);

  const resolveProductImage = (url) => {
    if (!url) return "/images/home-hero.jpeg";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
  };

  const toNum = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const getDisplayPrices = (product) => {
    const original = toNum(product?.originalPrice, toNum(product?.price, 0));
    let discounted = toNum(product?.price, original);

    // fallback in case API returns only original/base value
    if (discounted >= original && activeOffer?.discountValue) {
      if (activeOffer.discountType === "percent") {
        discounted = original - (original * toNum(activeOffer.discountValue, 0)) / 100;
      } else {
        discounted = original - toNum(activeOffer.discountValue, 0);
      }
    }

    discounted = Math.max(0, discounted);
    const rawPct = original > 0 ? ((original - discounted) / original) * 100 : 0;
    const discountPercent = Math.max(0, Math.round(rawPct));

    return { original, discounted, discountPercent };
  };

  if (activeOffer?.products?.length) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 min-h-[82vh]">
        <Seo
          title="Exclusive Offers | HI-TECH Electronics Store"
          description="Limited-time special offers on selected products."
          canonicalPath="/offers"
        />
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 text-white shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold">{activeOffer.title || "Exclusive Special Offer"}</h1>
            <p className="mt-2 text-sm sm:text-base">
              Valid from {new Date(activeOffer.startsAt).toLocaleString()} to {new Date(activeOffer.endsAt).toLocaleString()}
            </p>
            <p className="mt-1 text-sm sm:text-base font-semibold">
              {activeOffer.discountType === "percent"
                ? `${Number(activeOffer.discountValue || 0)}% OFF`
                : `€${Number(activeOffer.discountValue || 0)} OFF`}
            </p>
            <p className="mt-1 text-sm sm:text-base font-semibold">{timeLeftLabel}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeOffer.products.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className="card p-4 relative overflow-hidden">
                {(() => {
                  const { discountPercent } = getDisplayPrices(p);
                  return discountPercent > 0 ? (
                    <span className="absolute top-3 right-3 rounded-full bg-red-600 text-white text-xs font-bold px-2.5 py-1 shadow">
                      {discountPercent}% OFF
                    </span>
                  ) : null;
                })()}
                <img
                  src={resolveProductImage(p.images?.[0])}
                  alt={p.name}
                  className="h-44 w-full object-cover rounded-xl"
                />
                <div className="mt-3">
                  <div className="font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">{p.brand}</div>
                  {(() => {
                    const { original, discounted } = getDisplayPrices(p);
                    return (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-blue-700 font-bold">{formatCurrency(discounted)}</span>
                    {original > discounted && (
                      <span className="text-gray-500 text-sm line-through">{formatCurrency(original)}</span>
                    )}
                  </div>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const offersBgDesktop =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772785501/ChatGPT_Image_Mar_6_2026_01_54_47_PM_v0uijm.png";
  const offersBgMobile =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772866981/ChatGPT_Image_Mar_7_2026_12_32_08_PM_ltqnfo.png";
  const flyers = Array.from({ length: 18 }, (_, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    return {
      left: `${16 + ((i * 4.5) % 68)}%`,
      x: `${direction * (24 + (i % 5) * 16)}px`,
      y: `${-90 - (i % 6) * 20}px`,
      delay: `${(1.1 + i * 0.06).toFixed(2)}s`,
      dur: `${(1.2 + (i % 4) * 0.16).toFixed(2)}s`,
      rot: `${direction * (100 + (i % 5) * 35)}deg`,
      color: ["#fde047", "#f97316", "#fb7185", "#60a5fa"][i % 4],
    };
  });

  return (
    <div
      className="offers-page-bg px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 min-h-[82vh] sm:min-h-[86vh] lg:min-h-[90vh] bg-cover bg-no-repeat flex items-end justify-center"
      style={{
        backgroundImage: `url('${offersBgDesktop}')`,
      }}
    >
      <Seo
        title="Offers | HI-TECH Electronics Store"
        description="Latest offers and promotions from HI-TECH Electronics Store."
        canonicalPath="/offers"
      />
      <div className="offers-page-content w-full p-4 sm:p-8 lg:p-10 text-center max-w-4xl mx-auto bg-transparent">
        <div className="gift-wrap mx-auto">
          <div className="flyers-layer" aria-hidden="true">
            {flyers.map((flyer, idx) => (
              <span
                key={`${flyer.left}-${idx}`}
                className="paper-flyer"
                style={{
                  left: flyer.left,
                  "--flyer-x": flyer.x,
                  "--flyer-y": flyer.y,
                  "--flyer-delay": flyer.delay,
                  "--flyer-dur": flyer.dur,
                  "--flyer-rot": flyer.rot,
                  "--flyer-color": flyer.color,
                }}
              />
            ))}
          </div>
          <p className="gift-message text-2xl sm:text-3xl font-bold">Coming soon</p>
          <div className="gift-box">
            <div className="gift-lid">
              <span className="gift-knot" />
            </div>
            <div className="gift-body">
              <span className="gift-ribbon-v" />
              <span className="gift-ribbon-h" />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .offers-page-bg {
          background-position: center 14%;
          background-size: cover;
        }
        @media (max-width: 640px) {
          .offers-page-bg {
            background-image: url('${offersBgMobile}') !important;
            background-size: cover;
            background-position: center top;
            background-color: #1f2433;
            min-height: 68vh;
            padding-bottom: 0;
            padding-top: 0;
          }
          .offers-page-content {
            padding: 0;
          }
        }
        @media (max-width: 420px) {
          .offers-page-bg {
            background-size: 104% auto;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .offers-page-bg {
            background-position: center 18%;
            background-size: 130% auto;
          }
        }
        .gift-wrap {
          width: min(92vw, 340px);
          max-width: 100%;
          position: relative;
          padding-top: 10px;
          margin-top: 72px;
        }
        .gift-box {
          width: clamp(150px, 36vw, 180px);
          margin: 0 auto;
          position: relative;
          height: clamp(140px, 30vw, 160px);
        }
        .gift-body {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 110px;
          background: linear-gradient(180deg, #f43f5e, #e11d48);
          border-radius: 12px;
          box-shadow: 0 14px 26px rgba(225, 29, 72, 0.32);
          overflow: hidden;
        }
        .gift-lid {
          position: absolute;
          top: clamp(20px, 4.5vw, 24px);
          left: -3.5%;
          width: 107%;
          height: clamp(32px, 8vw, 38px);
          border-radius: 10px;
          background: linear-gradient(180deg, #fb7185, #f43f5e);
          transform-origin: left bottom;
          animation: giftOpen 1.3s ease-out 0.5s forwards;
          box-shadow: 0 8px 14px rgba(244, 63, 94, 0.34);
          z-index: 3;
        }
        .flyers-layer {
          position: absolute;
          left: 0;
          right: 0;
          top: clamp(44px, 11vw, 54px);
          height: clamp(90px, 24vw, 120px);
          pointer-events: none;
          overflow: visible;
          z-index: 4;
        }
        .paper-flyer {
          position: absolute;
          bottom: 0;
          width: 9px;
          height: 14px;
          border-radius: 2px;
          background: var(--flyer-color, #fde047);
          opacity: 0;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
          animation: flyerBlast var(--flyer-dur, 1.2s) ease-out var(--flyer-delay, 1.1s) infinite;
        }
        .gift-knot {
          position: absolute;
          left: 50%;
          top: -12px;
          width: 22px;
          height: 22px;
          margin-left: -11px;
          border-radius: 999px;
          border: 4px solid #fef08a;
          background: #facc15;
          box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.2);
        }
        .gift-ribbon-v {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 24px;
          margin-left: -12px;
          background: #fef08a;
        }
        .gift-ribbon-h {
          position: absolute;
          top: 20px;
          left: 0;
          width: 100%;
          height: 20px;
          background: #fde047;
        }
        .gift-message {
          display: inline-block;
          margin-bottom: clamp(10px, 2.4vw, 18px);
          margin-left: clamp(86px, 22vw, 132px);
          line-height: 1.2;
          padding-bottom: 0.14em;
          background: linear-gradient(90deg, #facc15, #fb7185);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
          position: relative;
          z-index: 6;
          opacity: 0;
          transform: translateY(10px) scale(0.97);
          animation:
            revealText 0.8s ease 1.65s forwards,
            textSwing 2s ease-in-out 2.45s infinite;
        }
        @media (max-width: 640px) {
          .gift-wrap {
            width: min(88vw, 300px);
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: -188px;
          }
          .paper-flyer {
            width: 7px;
            height: 11px;
          }
          .gift-message {
            margin-left: 56px;
            margin-bottom: 14px;
            display: block;
            text-align: center;
          }
          .gift-box {
            margin-top: 6px;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .gift-wrap {
            width: min(70vw, 330px);
            margin-top: 0;
          }
          .gift-message {
            margin-left: clamp(96px, 18vw, 126px);
          }
        }
        @media (min-width: 1025px) {
          .gift-wrap {
            margin-top: 92px;
          }
          .gift-message {
            margin-left: clamp(64px, 14vw, 96px);
          }
        }
        @media (max-width: 420px) {
          .gift-wrap {
            margin-top: -176px;
          }
        }
        @keyframes giftOpen {
          0% { transform: rotate(0deg) translateY(0); }
          70% { transform: rotate(-58deg) translate(-30px, -16px); }
          100% { transform: rotate(-52deg) translate(-26px, -14px); }
        }
        @keyframes flyerBlast {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8);
          }
          18% {
            opacity: 1;
            transform: translate3d(calc(var(--flyer-x) * 0.42), calc(var(--flyer-y) * 0.42), 0)
              rotate(calc(var(--flyer-rot) * 0.5)) scale(1);
          }
          74% {
            opacity: 0.95;
            transform: translate3d(calc(var(--flyer-x) * 0.9), calc(var(--flyer-y) * 0.9), 0)
              rotate(var(--flyer-rot)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--flyer-x), var(--flyer-y), 0)
              rotate(calc(var(--flyer-rot) * 1.1)) scale(0.88);
          }
        }
        @keyframes revealText {
          0% { opacity: 0; transform: translateY(10px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes textSwing {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(0) rotate(4deg); }
          50% { transform: translateY(0) rotate(-4deg); }
          75% { transform: translateY(0) rotate(2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
