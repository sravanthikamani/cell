require("dotenv").config();
require("./db"); 
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const Product = require("./models/Product");
const Cart = require("./models/Cart"); 
const checkoutRoutes = require("./routes/checkout");
const Order = require("./models/Order");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const auth = require("./middleware/auth");
const paymentRoutes = require("./routes/payments");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const couponRoutes = require("./routes/coupons");
const wishlistRoutes = require("./routes/wishlist");
const {
  normalizePrice,
  normalizeProductPrice,
  normalizeCartProductPrices,
  INR_TO_EUR_RATE,
  PRICE_AUTO_CONVERT_THRESHOLD,
} = require("./utils/price");
const { buildCacheKey, getCached, setCached } = require("./utils/cache");

const app = express();
// Render and similar platforms run behind a reverse proxy.
// Required so express-rate-limit reads client IP safely from X-Forwarded-For.
app.set("trust proxy", 1);

const slowRequestMs = Number(process.env.SLOW_REQUEST_MS || 600);
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (durationMs >= slowRequestMs) {
      console.warn(
        `[perf] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`
      );
    }
  });
  next();
});

/* 🔹 Middlewares */
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (corsOrigins.length === 0) return cb(null, true);
    if (corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(compression());
app.use(express.json()); // ✅ REQUIRED for POST requests

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/checkout", apiLimiter, checkoutRoutes);
app.use("/api/orders", apiLimiter, orderRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/coupons", apiLimiter, couponRoutes);
app.use("/api/wishlist", apiLimiter, wishlistRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

async function autoNormalizeProductPrices() {
  const enabled = String(process.env.AUTO_NORMALIZE_PRICES || "true").toLowerCase() === "true";
  if (!enabled) return;

  const maxPriceDoc = await Product.findOne({}, { price: 1 }).sort({ price: -1 }).lean();
  const maxPrice = Number(maxPriceDoc?.price || 0);
  if (maxPrice <= PRICE_AUTO_CONVERT_THRESHOLD) return;

  const products = await Product.find({}, { _id: 1, price: 1 }).lean();
  const ops = products.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { price: normalizePrice(p.price) } },
    },
  }));

  if (ops.length) {
    const result = await Product.bulkWrite(ops);
    console.log(
      `Auto-normalized ${result.modifiedCount || 0} product prices using 1 EUR = ${INR_TO_EUR_RATE} INR`
    );
  }
}

autoNormalizeProductPrices().catch((err) => {
  console.error("Auto-normalize prices failed:", err.message);
});



app.get("/api/orders/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  const normalizedOrders = orders.map((order) => {
    const plain = order.toObject();
    plain.items = (plain.items || []).map((item) => ({
      ...item,
      price: normalizePrice(item.price ?? item.productId?.price ?? 0),
    }));
    plain.subtotal = normalizePrice(plain.subtotal ?? plain.total ?? 0);
    plain.discount = normalizePrice(plain.discount ?? 0);
    plain.shipping = normalizePrice(plain.shipping ?? 0);
    plain.tax = normalizePrice(plain.tax ?? 0);
    plain.total = normalizePrice(plain.total ?? 0);
    plain.grandTotal = normalizePrice(plain.grandTotal ?? plain.total ?? 0);
    return plain;
  });

  res.json(normalizedOrders);
});

app.get("/api/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(normalizeProductPrice(product));
});
app.get("/api/cart/:userId", async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId })
    .populate("items.productId");

  res.json(normalizeCartProductPrices(cart) || { items: [] });
});

app.post("/api/cart/update", async (req, res) => {
  const { userId, productId, qty, variant } = req.body;

  const cart = await Cart.findOne({ userId });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (qty > product.stock) {
    return res.status(400).json({ error: "Not enough stock" });
  }
  const item = cart.items.find(
    (i) =>
      i.productId._id.toString() === productId &&
      (i.variant?.size || "") === (variant?.size || "") &&
      (i.variant?.color || "") === (variant?.color || "")
  );

  if (item) item.qty = qty;
  await cart.save();

  res.json(cart);
});
app.post("/api/cart/remove", async (req, res) => {
  const { userId, productId, variant } = req.body;

  const cart = await Cart.findOne({ userId });
  cart.items = cart.items.filter(
    (i) =>
      !(
        i.productId._id.toString() === productId &&
        (i.variant?.size || "") === (variant?.size || "") &&
        (i.variant?.color || "") === (variant?.color || "")
      )
  );

  await cart.save();
  res.json(cart);
});


app.get("/api/products", (req, res) => {
  res.json({
    smartphones: {
      Samsung: ["Galaxy S23", "Galaxy A54"],
      Nothing: ["Phone 1", "Phone 2"],
      Oppo: ["Reno 8", "Find X"],
      Realme: ["GT Neo", "Narzo"],
      Mi: ["Redmi Note 12", "Mi 11X"],
    },
    tablets: {
      Samsung: ["Galaxy Tab S8"],
      Apple: ["iPad Pro"],
    },
  });
});

/* =========================
   MENU DATA
========================= */
app.get("/api/menu", (req, res) => {
  res.json({
    device: [
      { label: "Smartphones", icon: "📱" },
      { label: "Tablets", icon: "💊" },
      { label: "Wearables", icon: "⌚" },
      { label: "Accessories", icon: "🎧" },
    ],
    category: [
      { label: "Audio", icon: "🎵" },
      { label: "Chargers", icon: "🔌" },
      { label: "Cables", icon: "🧵" },
      { label: "Power Banks", icon: "🔋" },
    ],
    faq: [
      { label: "Shipping", icon: "🚚" },
      { label: "Product", icon: "📦" },
      { label: "Warranty", icon: "🛡️" },
      { label: "General", icon: "❓" },
    ],
  });
});

app.get("/api/products/search", async (req, res) => {
  try {
    const cacheKey = buildCacheKey(req, "product-search");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const {
      q,
      brand,
      group,
      type,
      priceMin,
      priceMax,
      sort,
    } = req.query;

    const filter = {};

    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: new RegExp(safe, "i") },
        { brand: new RegExp(safe, "i") },
      ];
    }
    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (group) filter.group = new RegExp(`^${group}$`, "i");
    if (type) filter.type = new RegExp(`^${type}$`, "i");

    const min = Number(priceMin);
    const max = Number(priceMax);

    let products = await Product.find(filter).lean();
    products = products
      .map((p) => ({ ...p, price: normalizePrice(p.price) }))
      .filter((p) => {
        if (!Number.isNaN(min) && p.price < min) return false;
        if (!Number.isNaN(max) && p.price > max) return false;
        return true;
      });

    if (sort === "price_asc") {
      products.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "popularity") {
      const ids = products.map((p) => p._id);
      let soldById = new Map();
      if (ids.length) {
        const soldRows = await Order.aggregate([
          { $match: { status: { $ne: "cancelled" }, "items.productId": { $in: ids } } },
          { $unwind: "$items" },
          { $match: { "items.productId": { $in: ids } } },
          {
            $group: {
              _id: "$items.productId",
              soldQty: { $sum: "$items.qty" },
            },
          },
        ]);
        soldById = new Map(
          soldRows.map((r) => [String(r._id), Number(r.soldQty || 0)])
        );
      }
      products.sort((a, b) => {
        const aSold = soldById.get(String(a._id)) || 0;
        const bSold = soldById.get(String(b._id)) || 0;
        if (bSold !== aSold) return bSold - aSold;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    } else {
      products.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }
    setCached(cacheKey, products, 60);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/catalog", async (req, res) => {
  const cacheKey = buildCacheKey(req, "catalog");
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  const products = await Product.find().lean();

  const catalog = {};

  products.forEach((p) => {
    if (!catalog[p.group]) catalog[p.group] = {};
    if (!catalog[p.group][p.type]) catalog[p.group][p.type] = {};
    if (!catalog[p.group][p.type][p.brand])
      catalog[p.group][p.type][p.brand] = [];

    catalog[p.group][p.type][p.brand].push({
      ...p,
      price: normalizePrice(p.price),
    });
  });

  setCached(cacheKey, catalog, 120);
  res.json(catalog);
});


app.post("/api/cart/add", async (req, res) => {
  const { userId, productId, variant } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const item = cart.items.find(
    (i) =>
      i.productId.toString() === productId &&
      (i.variant?.size || "") === (variant?.size || "") &&
      (i.variant?.color || "") === (variant?.color || "")
  );

  const currentQty = item ? item.qty : 0;
  if (currentQty + 1 > product.stock) {
    return res.status(400).json({ error: "Out of stock" });
  }

  if (item) item.qty += 1;
  else cart.items.push({ productId, qty: 1, variant: variant || {} });

  await cart.save();
  res.json(cart);
});


/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
