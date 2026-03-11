require("dotenv").config();
const { connectDB, mongoose } = require("../db");
const Product = require("../models/Product");

function detectDefaults(product) {
  const group = String(product.group || "").toLowerCase();
  const type = String(product.type || "").toLowerCase();

  if (group === "device" && type === "smartphones") {
    return {
      Display: product.display || '6.5" AMOLED',
      Processor: product.processor || "Snapdragon Series",
      RAM: product.ram || "8GB",
      Storage: product.storage || "128GB",
      Camera: product.camera || "Dual/Triple Camera",
      Battery: product.battery || "4500mAh",
      OS: product.os || "Android",
    };
  }

  if (group === "device" && type === "tablets") {
    return {
      Display: product.display || '11" Display',
      Processor: product.processor || "Octa-core chipset",
      RAM: product.ram || "8GB",
      Storage: product.storage || "128GB",
      Battery: product.battery || "8000mAh",
      OS: product.os || "Android / iPadOS",
    };
  }

  if ((group === "device" && type === "accessories") || (group === "category" && type === "audio")) {
    return {
      Type: "Wireless Audio Device",
      "Noise Cancellation": "Active Noise Canceling",
      Battery: product.battery || "Up to 30 hours",
      Connectivity: "Bluetooth",
      Charging: "USB-C",
    };
  }

  if (group === "category" && type === "power banks") {
    return {
      Capacity: product.battery || "20000mAh",
      Ports: "Dual USB",
      Charging: "Fast Charging",
      Compatibility: "Universal",
    };
  }

  if ((group === "device" && type === "wearables") || type.includes("watch")) {
    return {
      Display: product.display || "AMOLED",
      Features: "Health & Fitness Tracking",
      Connectivity: "Bluetooth / WiFi",
      Battery: product.battery || "Long-lasting",
      OS: product.os || "WearOS / watchOS",
    };
  }

  return {
    Feature: "General",
    Details: "Specification details available soon",
  };
}

function mapTopLevelFields(specs = {}, current = {}) {
  return {
    display: current.display || specs.Display || "",
    processor: current.processor || specs.Processor || "",
    ram: current.ram || specs.RAM || "",
    storage: current.storage || specs.Storage || "",
    camera: current.camera || specs.Camera || "",
    battery: current.battery || specs.Battery || "",
    os: current.os || specs.OS || "",
  };
}

async function run() {
  await connectDB();

  const products = await Product.find({}).lean();
  if (!products.length) {
    console.log("No products found.");
    return;
  }

  const ops = [];

  for (const p of products) {
    const existingSpecs = p?.specs && typeof p.specs === "object" ? p.specs : {};
    const hasSpecs = Object.keys(existingSpecs || {}).length > 0;

    if (hasSpecs) continue;

    const detected = detectDefaults(p);
    const top = mapTopLevelFields(detected, p);

    ops.push({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            specs: detected,
            display: top.display,
            processor: top.processor,
            ram: top.ram,
            storage: top.storage,
            camera: top.camera,
            battery: top.battery,
            os: top.os,
          },
        },
      },
    });
  }

  if (!ops.length) {
    console.log("All products already have specs. Nothing to update.");
    return;
  }

  const result = await Product.bulkWrite(ops);
  console.log(`Missing specs backfilled: modified=${result.modifiedCount || 0}, matched=${result.matchedCount || 0}`);
}

run()
  .catch((err) => {
    console.error("Backfill missing specs failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
