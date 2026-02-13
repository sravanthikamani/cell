const INR_TO_EUR_RATE = Number(process.env.INR_TO_EUR_RATE || 90);
const PRICE_AUTO_CONVERT_THRESHOLD = Number(
  process.env.PRICE_AUTO_CONVERT_THRESHOLD || 2000
);

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizePrice(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  if (n > PRICE_AUTO_CONVERT_THRESHOLD) {
    return round2(n / INR_TO_EUR_RATE);
  }
  return round2(n);
}

function normalizeProductPrice(product) {
  if (!product) return product;
  const plain =
    typeof product.toObject === "function" ? product.toObject() : { ...product };
  plain.price = normalizePrice(plain.price);
  return plain;
}

function normalizeCartProductPrices(cart) {
  if (!cart) return cart;
  const plain = typeof cart.toObject === "function" ? cart.toObject() : { ...cart };
  plain.items = (plain.items || []).map((item) => ({
    ...item,
    productId: normalizeProductPrice(item.productId),
  }));
  return plain;
}

module.exports = {
  INR_TO_EUR_RATE,
  PRICE_AUTO_CONVERT_THRESHOLD,
  normalizePrice,
  normalizeProductPrice,
  normalizeCartProductPrices,
};
