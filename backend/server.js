require("dotenv").config();
require("./db"); 
const express = require("express");
const cors = require("cors");
const Product = require("./models/Product");
const Cart = require("./models/Cart"); 
const checkoutRoutes = require("./routes/checkout");
const Order = require("./models/Order");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const auth = require("./middleware/auth");
const paymentRoutes = require("./routes/payments");

const app = express();

/* 🔹 Middlewares */
app.use(cors());
app.use(express.json()); // ✅ REQUIRED for POST requests
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);



app.get("/api/orders/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
});

app.get("/api/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});
app.get("/api/cart/:userId", async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId })
    .populate("items.productId");

  res.json(cart || { items: [] });
});

app.post("/api/cart/update", async (req, res) => {
  const { userId, productId, qty } = req.body;

  const cart = await Cart.findOne({ userId });
  const item = cart.items.find(
    (i) => i.productId._id.toString() === productId
  );

  if (item) item.qty = qty;
  await cart.save();

  res.json(cart);
});
app.post("/api/cart/remove", async (req, res) => {
  const { userId, productId } = req.body;

  const cart = await Cart.findOne({ userId });
  cart.items = cart.items.filter(
    (i) => i.productId._id.toString() !== productId
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

app.get("/api/catalog", async (req, res) => {
  const products = await Product.find();

  const catalog = {};

  products.forEach((p) => {
    if (!catalog[p.group]) catalog[p.group] = {};
    if (!catalog[p.group][p.type]) catalog[p.group][p.type] = {};
    if (!catalog[p.group][p.type][p.brand])
      catalog[p.group][p.type][p.brand] = [];

    catalog[p.group][p.type][p.brand].push(p);
  });

  res.json(catalog);
});


app.post("/api/cart/add", async (req, res) => {
  const { userId, productId } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const item = cart.items.find(
    (i) => i.productId.toString() === productId
  );

  if (item) {
    item.qty += 1;
  } else {
    cart.items.push({ productId, qty: 1 });
  }

  await cart.save();
  res.json(cart);
});


/* =========================
   SERVER
========================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
