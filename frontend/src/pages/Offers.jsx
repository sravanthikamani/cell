import Seo from "../components/Seo";

export default function Offers() {
  const offersBg =
    "https://res.cloudinary.com/dlx9tnj7p/image/upload/v1772785501/ChatGPT_Image_Mar_6_2026_01_54_47_PM_v0uijm.png";
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
      className="px-4 sm:px-6 lg:px-10 py-8 sm:py-10 min-h-[90vh] bg-cover bg-center bg-no-repeat flex items-end justify-center"
      style={{
        backgroundImage: `url('${offersBg}')`,
      }}
    >
      <Seo
        title="Offers | HI-TECH Electronics Store"
        description="Latest offers and promotions from HI-TECH Electronics Store."
        canonicalPath="/offers"
      />
      <div className="p-8 sm:p-12 text-center max-w-3xl mx-auto bg-transparent">
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
        .gift-wrap {
          width: 220px;
          max-width: 100%;
          position: relative;
          padding-top: 8px;
        }
        .gift-box {
          width: 180px;
          margin: 0 auto;
          position: relative;
          height: 160px;
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
          top: 24px;
          left: -6px;
          width: 192px;
          height: 38px;
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
          top: 52px;
          height: 120px;
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
          margin-bottom: 18px;
          margin-left: 112px;
          line-height: 1.2;
          padding-bottom: 0.14em;
          background: linear-gradient(90deg, #facc15, #fb7185);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
          opacity: 0;
          transform: translateY(10px) scale(0.97);
          animation:
            revealText 0.8s ease 1.65s forwards,
            textSwing 2s ease-in-out 2.45s infinite;
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
