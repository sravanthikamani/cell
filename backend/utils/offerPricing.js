const Offer = require("../models/Offer");
const { normalizePrice } = require("./price");

function sanitizeDiscountType(type) {
  const value = String(type || "").toLowerCase();
  return value === "fixed" ? "fixed" : "percent";
}

function sanitizeDiscountValue(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return n;
}

function applyDiscount(basePrice, discountType, discountValue) {
  const base = normalizePrice(basePrice);
  if (discountType === "fixed") {
    return normalizePrice(Math.max(0, base - Number(discountValue || 0)));
  }
  return normalizePrice(Math.max(0, base - (base * Number(discountValue || 0)) / 100));
}

async function getActiveOfferForProductIds(productIds = []) {
  const ids = (productIds || []).filter(Boolean).map((id) => String(id));
  if (ids.length === 0) return null;

  const now = new Date();
  const offer = await Offer.findOne({
    isEnabled: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
    productIds: { $in: ids },
  })
    .sort({ endsAt: 1, createdAt: -1 })
    .lean();

  if (!offer) return null;

  const discountType = sanitizeDiscountType(offer.discountType);
  const discountValue = sanitizeDiscountValue(offer.discountValue);
  const productIdSet = new Set((offer.productIds || []).map((id) => String(id)));

  return {
    id: String(offer._id),
    discountType,
    discountValue,
    productIdSet,
  };
}

function getOfferAdjustedUnitPrice({ productId, basePrice, activeOffer }) {
  const base = normalizePrice(basePrice);
  if (!activeOffer) return base;
  if (!activeOffer.productIdSet?.has(String(productId))) return base;
  return applyDiscount(base, activeOffer.discountType, activeOffer.discountValue);
}

module.exports = {
  getActiveOfferForProductIds,
  getOfferAdjustedUnitPrice,
};
