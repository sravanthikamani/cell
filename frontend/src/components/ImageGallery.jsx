import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

export default function ImageGallery({ images, altText }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [JSON.stringify(images || [])]);

  if (!images || images.length === 0) return null;
  const resolveSrc = (src) =>
    src && src.startsWith("/uploads")
      ? `${API_BASE}${src}`
      : src;

  return (
    <>
      {/* MAIN IMAGE */}
      <img
        src={resolveSrc(images[active])}
        alt={altText || "Product image"}
        className="w-full h-96 object-contain border cursor-zoom-in"
        onClick={() => setZoom(true)}
        width="600"
        height="384"
        loading="lazy"
      />

      {/* THUMBNAILS */}
      <div className="flex gap-2 mt-3">
        {images.map((img, i) => (
          <img
            key={i}
            src={resolveSrc(img)}
            alt={altText ? `${altText} ${i + 1}` : `Product image ${i + 1}`}
            onClick={() => setActive(i)}
            className={`w-16 h-16 object-cover border cursor-pointer ${
              i === active ? "border-black" : ""
            }`}
            width="64"
            height="64"
            loading="lazy"
          />
        ))}
      </div>

      {/* ZOOM MODAL */}
      {zoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setZoom(false)}
        >
          <img
            src={resolveSrc(images[active])}
            alt={altText || "Product image"}
            className="max-h-[90vh] max-w-[90vw]"
            width="600"
            height="384"
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}
