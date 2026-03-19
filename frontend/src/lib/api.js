const envApiBase = (import.meta.env.VITE_API_URL || "").trim();
const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Use HTTPS for production, HTTP for localhost
export const API_BASE =
  envApiBase ||
  (isLocalhost
    ? "http://localhost:5001"
    : "https://hitechcinisello.it/api");

if (isBrowser) {
  console.log("[DEBUG] API_BASE:", API_BASE);
}
