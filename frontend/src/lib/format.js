const INR_TO_EUR_RATE = Number(import.meta.env.VITE_INR_TO_EUR_RATE || 90);
const INR_LIKE_THRESHOLD = Number(import.meta.env.VITE_INR_LIKE_THRESHOLD || 2000);

function normalizeDisplayAmount(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return 0;
  if (value > INR_LIKE_THRESHOLD) {
    return value / INR_TO_EUR_RATE;
  }
  return value;
}

export function formatCurrency(amount, lang = "en") {
  const locale = lang === "it" ? "it-IT" : "en-IE";
  const value = normalizeDisplayAmount(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
