require("./db");
const Product = require("./models/Product");

const products = [
  {
    group: "device",
    type: "smartphones",
    brand: "Samsung",
    name: "Galaxy S23",
    price: 74999,
    ram: "8GB",
    storage: "128GB",
    images: [
      "/images/galaxy-s23-1.jpg",
      "/images/galaxy-s23-2.jpg",
    ],
  },
  {
    group: "device",
    type: "smartphones",
    brand: "Samsung",
    name: "Galaxy A54",
    price: 38999,
    ram: "8GB",
    storage: "256GB",
    images: [
      "/images/galaxy-a54-1.jpg",
      "/images/galaxy-a54-2.jpg",
    ],
  },
  {
    group: "category",
    type: "audio",
    brand: "Sony",
    name: "WH-1000XM5",
    price: 29999,
    images: ["/images/wh-1000xm5.jpg"],
  },
];

async function seed() {
  await Product.deleteMany();
  await Product.insertMany(products);
  console.log("✅ Products inserted");
  process.exit();
}

seed();
