const express = require("express");
const Offer = require("../models/Offer");
const { normalizePrice } = require("../utils/price");

const router = express.Router();

router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const offer = await Offer.findOne({
      isEnabled: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .sort({ endsAt: 1, createdAt: -1 })
      .populate("productIds")
      .lean();

    if (!offer) {
      return res.json({ active: false, offer: null });
    }

    const safeDiscountType = ["percent", "fixed"].includes(
      String(offer.discountType || "").toLowerCase()
    )
      ? String(offer.discountType).toLowerCase()
      : "percent";
    const rawDiscountValue = Number(offer.discountValue || 0);
    const safeDiscountValue = Number.isFinite(rawDiscountValue) && rawDiscountValue > 0
      ? rawDiscountValue
      : 10;

    const discountedPrice = (base, type, value) => {
      const n = Number(base || 0);
      if (!Number.isFinite(n)) return 0;
      if (type === "percent") {
        return Math.max(0, n - (n * Number(value || 0)) / 100);
      }
      return Math.max(0, n - Number(value || 0));
    };

    const products = (offer.productIds || []).map((p) => {
      const base = normalizePrice(p?.price);
      const sale = normalizePrice(
        discountedPrice(base, safeDiscountType, safeDiscountValue)
      );
      return {
        ...p,
        originalPrice: base,
        price: sale,
      };
    });

    return res.json({
      active: true,
      offer: {
        id: String(offer._id),
        title: offer.title || "Exclusive Special Offer",
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
        discountType: safeDiscountType,
        discountValue: safeDiscountValue,
        products,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load active offer" });
  }
});

module.exports = router;
