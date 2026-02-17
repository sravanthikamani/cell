function getShippingConfig() {
  const standardBase = Number(
    process.env.SHIPPING_STANDARD || process.env.SHIPPING_FLAT || 0
  );
  const expressBase = Number(
    process.env.SHIPPING_EXPRESS || standardBase + 50
  );
  const freeThreshold = Number(process.env.SHIPPING_FREE_THRESHOLD || 999);
  const taxRate = Number(process.env.TAX_RATE || 0);

  return {
    standardBase: Math.max(0, Math.round(standardBase)),
    expressBase: Math.max(0, Math.round(expressBase)),
    freeThreshold: Math.max(0, Number.isFinite(freeThreshold) ? freeThreshold : 999),
    taxRate: Number.isFinite(taxRate) ? taxRate : 0,
  };
}

function normalizeShippingOption(option = "standard") {
  const value = String(option || "standard").trim().toLowerCase();
  if (value === "express" || value === "pickup") return value;
  return "standard";
}

function computeOrderTotals({ subtotal = 0, discount = 0, shippingOption = "standard" }) {
  const config = getShippingConfig();
  const option = normalizeShippingOption(shippingOption);
  const safeSubtotal = Math.max(0, Number(subtotal || 0));
  const safeDiscount = Math.max(0, Math.min(Number(discount || 0), safeSubtotal));
  const taxable = Math.max(0, safeSubtotal - safeDiscount);

  let shipping = 0;
  if (option === "express") {
    shipping = config.expressBase;
  } else if (option === "pickup") {
    shipping = 0;
  } else {
    shipping = taxable >= config.freeThreshold ? 0 : config.standardBase;
  }

  const tax = Math.round((taxable * config.taxRate) / 100);
  const total = taxable + tax + shipping;

  return {
    taxable,
    tax,
    shipping,
    total,
    shippingOption: option,
    taxRate: config.taxRate,
    freeShippingThreshold: config.freeThreshold,
  };
}

module.exports = {
  getShippingConfig,
  normalizeShippingOption,
  computeOrderTotals,
};
