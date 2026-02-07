export function formatCurrency(amount, lang = "en") {
  const locale = lang === "it" ? "it-IT" : "en-IE";
  const value = Number(amount || 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
