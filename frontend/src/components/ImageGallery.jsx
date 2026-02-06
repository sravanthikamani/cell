import { useState } from "react";

export default function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* MAIN IMAGE */}
      <img
        src={images[active]}
        alt=""
        className="w-full h-96 object-contain border cursor-zoom-in"
        onClick={() => setZoom(true)}
      />

      {/* THUMBNAILS */}
      <div className="flex gap-2 mt-3">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => setActive(i)}
            className={`w-16 h-16 object-cover border cursor-pointer ${
              i === active ? "border-black" : ""
            }`}
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
            src={images[active]}
            className="max-h-[90vh] max-w-[90vw]"
          />
        </div>
      )}
    </>
  );
}
