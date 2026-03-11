require("dotenv").config();
const { connectDB, mongoose } = require("../db");
const Product = require("../models/Product");

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const entries = [
  {
    names: ["Mi 13 Max"],
    seoDescription:
      "Mi 13 Max is a powerful flagship smartphone featuring a high-performance processor, advanced camera system, and a stunning AMOLED display, making it perfect for gaming, photography, and everyday performance.",
    longDescription:
      "The Mi 13 Max delivers premium smartphone performance with cutting-edge hardware and a sleek design. Built for speed and efficiency, this device comes with a powerful chipset that ensures smooth multitasking, gaming, and app performance. The advanced camera system captures stunning photos and videos, while the large AMOLED display provides vibrant colors and immersive viewing. With long-lasting battery life and fast charging support, the Mi 13 Max is designed for modern smartphone users who demand performance and reliability.",
    specs: {
      Display: '6.7" AMOLED Display',
      Processor: "Snapdragon Series",
      RAM: "8GB / 12GB",
      Storage: "256GB",
      Camera: "Triple Camera Setup",
      Battery: "5000mAh Fast Charging",
      OS: "Android",
    },
  },
  {
    names: ["Galaxy S23"],
    seoDescription:
      "Samsung Galaxy S23 is a premium Android smartphone with a powerful Snapdragon processor, professional-grade camera system, and a stunning AMOLED display.",
    longDescription:
      "The Samsung Galaxy S23 is designed for users who want flagship performance and exceptional photography. It features a powerful processor that delivers smooth gaming and multitasking performance. The advanced camera system allows users to capture high-quality photos even in low light conditions. Its sleek design, vibrant AMOLED display, and long battery life make it one of the best premium smartphones available today.",
    specs: {
      Display: '6.1" Dynamic AMOLED',
      Processor: "Snapdragon 8 Gen Series",
      RAM: "8GB",
      Storage: "128GB / 256GB",
      Camera: "Triple Camera",
      Battery: "3900mAh",
      OS: "Android",
    },
  },
  {
    names: ["Reno 8", "OPPO Reno 8", "Oppo Reno 8"],
    seoDescription:
      "OPPO Reno 8 smartphone offers stylish design, fast charging, powerful performance, and an advanced camera system for modern users.",
    longDescription:
      "The OPPO Reno 8 combines style and performance in a sleek smartphone design. It features a powerful processor for smooth multitasking and gaming, along with an advanced camera system that captures sharp and vibrant photos. With fast charging technology and a long-lasting battery, the Reno 8 ensures you stay connected throughout the day.",
    specs: {
      Display: '6.4" AMOLED',
      Processor: "MediaTek Dimensity",
      RAM: "8GB",
      Storage: "128GB",
      Camera: "50MP Main Camera",
      Battery: "4500mAh",
      OS: "Android",
    },
  },
  {
    names: ["Galaxy Tab S8"],
    seoDescription:
      "Samsung Galaxy Tab S8 is a powerful Android tablet with a stunning display, S-Pen support, and high performance for work and entertainment.",
    longDescription:
      "The Galaxy Tab S8 offers powerful performance in a sleek tablet design. Equipped with a vibrant display and S-Pen support, it is perfect for productivity, creativity, and entertainment. Whether you're watching movies, drawing, or working on documents, the Tab S8 provides a smooth and immersive experience.",
    specs: {
      Display: '11" LCD',
      Processor: "Snapdragon",
      RAM: "8GB",
      Storage: "128GB",
      Battery: "8000mAh",
      OS: "Android",
    },
  },
  {
    names: ["iPad Pro 11", "iPad Pro"],
    seoDescription:
      "Apple iPad Pro 11 delivers professional-level performance with the powerful M-series chip, stunning Liquid Retina display, and Apple Pencil support.",
    longDescription:
      "The iPad Pro 11 is designed for professionals, creatives, and productivity enthusiasts. Powered by Apple's advanced M-series chip, it delivers desktop-level performance in a portable tablet. The Liquid Retina display offers stunning color accuracy, while Apple Pencil support allows users to sketch, design, and take notes effortlessly.",
    specs: {
      Display: '11" Liquid Retina',
      Processor: "Apple M-series Chip",
      Storage: "128GB / 256GB",
      Camera: "12MP",
      Battery: "All-day battery",
      OS: "iPadOS",
    },
  },
  {
    names: ["WH-1000XM5"],
    seoDescription:
      "Sony WH-1000XM5 wireless headphones deliver industry-leading noise cancellation and premium sound quality.",
    longDescription:
      "The Sony WH-1000XM5 headphones offer exceptional sound quality with advanced noise-canceling technology. Designed for comfort and long listening sessions, they feature powerful drivers, adaptive sound control, and long battery life, making them ideal for travel, work, and music lovers.",
    specs: {
      Type: "Wireless Headphones",
      "Noise Cancellation": "Active Noise Canceling",
      Battery: "Up to 30 hours",
      Connectivity: "Bluetooth",
      Charging: "USB-C",
    },
  },
  {
    names: ["PowerCore 20K", "Powercore 20k"],
    seoDescription:
      "PowerCore 20K power bank provides high-capacity portable charging for smartphones, tablets, and other USB devices.",
    longDescription:
      "The PowerCore 20K power bank offers massive battery capacity, allowing you to charge your devices multiple times. Built with advanced charging technology, it ensures safe, fast, and reliable charging wherever you go.",
    specs: {
      Capacity: "20000mAh",
      Ports: "Dual USB",
      Charging: "Fast Charging",
      Compatibility: "Universal",
    },
  },
  {
    names: ["Apple Watch Series 9"],
    seoDescription:
      "Apple Watch Series 9 is a powerful smartwatch with advanced health monitoring, fitness tracking, and seamless Apple ecosystem integration.",
    longDescription:
      "Apple Watch Series 9 delivers advanced health monitoring, activity tracking, and smart connectivity in a premium wearable experience.",
    specs: {
      Display: "Retina Always-On",
      Features: "Heart Rate, Fitness Tracking",
      Connectivity: "Bluetooth / WiFi",
      Battery: "18 hours",
    },
  },
  {
    names: ["Galaxy Watch 6"],
    seoDescription:
      "Samsung Galaxy Watch 6 smartwatch offers advanced health tracking, fitness monitoring, and stylish design.",
    longDescription:
      "Galaxy Watch 6 combines stylish design with practical wellness and fitness tracking features for everyday smart wearable use.",
    specs: {
      Display: "AMOLED",
      Features: "Sleep Tracking, Heart Rate",
      Battery: "Long-lasting",
      OS: "WearOS",
    },
  },
  {
    names: ["QC Ultra", "Bose QC Ultra"],
    seoDescription:
      "QC Ultra wireless headphones deliver premium sound quality with advanced active noise cancellation, comfortable design, and long battery life for music lovers and travelers.",
    specs: {
      Type: "Wireless Headphones",
      "Noise Cancellation": "Active Noise Canceling",
      Connectivity: "Bluetooth 5.3",
      "Battery Life": "Up to 24 Hours",
      Charging: "USB-C Fast Charging",
      Features: "Spatial Audio, Touch Controls",
    },
  },
  {
    names: ["Phone 2", "Nothing Phone 2", "phone 2"],
    seoDescription:
      "Phone 2 is a powerful smartphone featuring a sleek design, fast processor, high-quality camera system, and long battery life for everyday performance and entertainment.",
    specs: {
      Display: '6.7" OLED',
      Processor: "Snapdragon 8 Series",
      RAM: "8GB / 12GB",
      Storage: "128GB / 256GB",
      Camera: "Dual Camera System",
      Battery: "4700mAh",
      OS: "Android",
    },
  },
  {
    names: ["Power Bank 3i"],
    seoDescription:
      "Power Bank 3i is a portable charging solution with high battery capacity and multiple charging ports, perfect for powering smartphones, tablets, and other devices on the go.",
    specs: {
      Capacity: "10000mAh",
      Ports: "Dual USB Output",
      Input: "USB-C / Micro USB",
      Charging: "Fast Charging",
      Compatibility: "Smartphones, Tablets",
    },
  },
  {
    names: ["30W Dart Power Bank"],
    seoDescription:
      "30W Dart Power Bank supports ultra-fast charging technology, allowing smartphones and gadgets to recharge quickly and efficiently.",
    specs: {
      Capacity: "10000mAh",
      Output: "30W Fast Charging",
      Ports: "USB-C",
      Technology: "Dart Charge",
      Safety: "Overcharge Protection",
    },
  },
  {
    names: ["Nano 65W Charger", "Nano 65W"],
    seoDescription:
      "Nano 65W fast charger is a compact and powerful charging adapter designed for laptops, smartphones, and tablets with efficient GaN charging technology.",
    specs: {
      "Power Output": "65W",
      Technology: "GaN Fast Charging",
      Port: "USB-C",
      Compatibility: "Laptops, Tablets, Smartphones",
      Safety: "Temperature Control",
    },
  },
  {
    names: ["BoostCharge 30W", "Boost Charge 30W"],
    seoDescription:
      "BoostCharge 30W fast charger provides reliable and efficient charging for modern smartphones and USB-C devices.",
    specs: {
      "Power Output": "30W",
      Port: "USB-C",
      Charging: "Fast Charging",
      Compatibility: "Smartphones, Tablets",
      Protection: "Over-voltage Protection",
    },
  },
  {
    names: ["USB-C Cable", "USB C Cable"],
    seoDescription:
      "USB-C cable offers fast charging and high-speed data transfer for smartphones, tablets, and laptops with durable construction.",
    specs: {
      Connector: "USB-C",
      Length: "1 Meter",
      "Data Transfer": "High Speed",
      Charging: "Fast Charging Support",
      Compatibility: "Universal USB-C Devices",
    },
  },
  {
    names: ["PowerLine+", "Powerline+", "PowerLine Plus"],
    seoDescription:
      "PowerLine+ charging cable features reinforced braided nylon for durability, ensuring fast charging and reliable data transfer.",
    specs: {
      Material: "Braided Nylon",
      Connector: "USB-C",
      Durability: "Reinforced Design",
      Charging: "Fast Charging",
      "Data Transfer": "High Speed",
    },
  },
  {
    names: ["Rugged Armor Case", "Rugged Armour Case"],
    seoDescription:
      "Rugged Armor Case provides superior protection for smartphones with shock-absorbing materials and a slim, stylish design.",
    specs: {
      Material: "TPU Shockproof",
      Protection: "Drop Protection",
      Design: "Slim Fit",
      Compatibility: "Smartphone Models",
      Features: "Anti-Scratch",
    },
  },
];

function mapTopLevelSpecs(specs = {}) {
  return {
    display: specs.Display || "",
    processor: specs.Processor || "",
    ram: specs.RAM || "",
    storage: specs.Storage || "",
    camera: specs.Camera || "",
    battery: specs.Battery || specs["Battery Life"] || "",
    os: specs.OS || "",
  };
}

async function findProductByNames(names = []) {
  for (const n of names) {
    const exact = await Product.findOne({ name: new RegExp(`^${escapeRegex(n)}$`, "i") });
    if (exact) return exact;
  }
  for (const n of names) {
    const partial = await Product.findOne({ name: new RegExp(escapeRegex(n), "i") });
    if (partial) return partial;
  }
  return null;
}

async function run() {
  await connectDB();

  let updated = 0;
  const notFound = [];

  for (const item of entries) {
    const product = await findProductByNames(item.names);
    if (!product) {
      notFound.push(item.names[0]);
      continue;
    }

    const topSpecs = mapTopLevelSpecs(item.specs);
    product.seoDescription = item.seoDescription;
    product.longDescription = item.longDescription || product.longDescription || item.seoDescription;
    product.description = item.seoDescription;
    product.specs = item.specs;

    if (topSpecs.display) product.display = topSpecs.display;
    if (topSpecs.processor) product.processor = topSpecs.processor;
    if (topSpecs.ram) product.ram = topSpecs.ram;
    if (topSpecs.storage) product.storage = topSpecs.storage;
    if (topSpecs.camera) product.camera = topSpecs.camera;
    if (topSpecs.battery) product.battery = topSpecs.battery;
    if (topSpecs.os) product.os = topSpecs.os;

    await product.save();
    updated += 1;
    console.log(`Updated: ${product.name}`);
  }

  console.log(`Done. Updated products: ${updated}`);
  if (notFound.length) {
    console.log(`Not found (${notFound.length}): ${notFound.join(", ")}`);
  }
}

run()
  .catch((err) => {
    console.error("Failed to apply provided details:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
