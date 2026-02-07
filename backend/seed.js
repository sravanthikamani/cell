require("./db");
const Product = require("./models/Product");

const products = [
  // Device -> Smartphones
  {
    group: "device",
    type: "smartphones",
    brand: "Samsung",
    name: "Galaxy S23",
    price: 74999,
    ram: "8GB",
    storage: "128GB",
    stock: 20,
    colors: ["black", "cream"],
    images: [
      "/images/galaxy-s23-1.jpg",
      "/images/galaxy-s23-2.jpg",
    ],
  },
  {
    group: "device",
    type: "smartphones",
    brand: "Nothing",
    name: "Phone 2",
    price: 44999,
    ram: "12GB",
    storage: "256GB",
    stock: 15,
    colors: ["white", "black"],
    images: ["/images/nothing-phone-2.jpg"],
  },
  {
    group: "device",
    type: "smartphones",
    brand: "Oppo",
    name: "Reno 8",
    price: 28999,
    ram: "8GB",
    storage: "128GB",
    stock: 25,
    images: ["/images/oppo-reno-8.jpg"],
  },
  // Device -> Tablets
  {
    group: "device",
    type: "tablets",
    brand: "Apple",
    name: "iPad Pro 11",
    price: 79999,
    storage: "128GB",
    stock: 10,
    colors: ["space gray", "silver"],
    images: ["/images/ipad-pro-11.jpg"],
  },
  {
    group: "device",
    type: "tablets",
    brand: "Samsung",
    name: "Galaxy Tab S8",
    price: 58999,
    storage: "128GB",
    stock: 12,
    images: ["/images/galaxy-tab-s8.jpg"],
  },
  // Device -> Wearables
  {
    group: "device",
    type: "wearables",
    brand: "Apple",
    name: "Apple Watch Series 9",
    price: 41999,
    stock: 18,
    colors: ["midnight", "starlight"],
    images: ["/images/apple-watch-9.jpg"],
  },
  {
    group: "device",
    type: "wearables",
    brand: "Samsung",
    name: "Galaxy Watch 6",
    price: 29999,
    stock: 22,
    images: ["/images/galaxy-watch-6.jpg"],
  },
  // Device -> Accessories
  {
    group: "device",
    type: "accessories",
    brand: "Anker",
    name: "PowerCore 20K",
    price: 2999,
    stock: 40,
    images: ["/images/anker-powercore-20k.jpg"],
  },
  {
    group: "device",
    type: "accessories",
    brand: "Spigen",
    name: "Rugged Armor Case",
    price: 1299,
    stock: 60,
    images: ["/images/spigen-rugged-armor.jpg"],
  },

  // Category -> Audio
  {
    group: "category",
    type: "audio",
    brand: "Sony",
    name: "WH-1000XM5",
    price: 29999,
    stock: 14,
    images: ["/images/wh-1000xm5.jpg"],
  },
  {
    group: "category",
    type: "audio",
    brand: "Bose",
    name: "QC Ultra",
    price: 32999,
    stock: 10,
    images: ["/images/bose-qc-ultra.jpg"],
  },
  // Category -> Chargers
  {
    group: "category",
    type: "chargers",
    brand: "Anker",
    name: "Nano 65W",
    price: 2499,
    stock: 50,
    images: ["/images/anker-nano-65w.jpg"],
  },
  {
    group: "category",
    type: "chargers",
    brand: "Belkin",
    name: "BoostCharge 30W",
    price: 1999,
    stock: 35,
    images: ["/images/belkin-boostcharge.jpg"],
  },
  // Category -> Cables
  {
    group: "category",
    type: "cables",
    brand: "AmazonBasics",
    name: "USB-C Cable",
    price: 499,
    stock: 80,
    images: ["/images/usb-c-cable.jpg"],
  },
  {
    group: "category",
    type: "cables",
    brand: "Anker",
    name: "PowerLine+",
    price: 899,
    stock: 70,
    images: ["/images/anker-powerline.jpg"],
  },
  // Category -> Power Banks
  {
    group: "category",
    type: "power banks",
    brand: "Mi",
    name: "Power Bank 3i",
    price: 1599,
    stock: 55,
    images: ["/images/mi-power-bank-3i.jpg"],
  },
  {
    group: "category",
    type: "power banks",
    brand: "Realme",
    name: "30W Dart Power Bank",
    price: 1999,
    stock: 45,
    images: ["/images/realme-dart-powerbank.jpg"],
  },
];

async function seed() {
  await Product.deleteMany();
  await Product.insertMany(products);
  console.log("✅ Products inserted");
  process.exit();
}

seed();
