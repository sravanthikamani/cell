require("../db");
const mongoose = require("mongoose");
const Product = require("../models/Product");

function toEur(inr, rate) {
  const value = Number(inr || 0) / rate;
  return Math.round(value * 100) / 100;
}

async function run() {
  const rate = Number(process.env.INR_TO_EUR_RATE || 90);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("INR_TO_EUR_RATE must be a positive number");
  }

  const products = await Product.find({}, { _id: 1, price: 1 }).lean();
  if (!products.length) {
    console.log("No products found. Nothing to convert.");
    return;
  }

  const maxPrice = Math.max(...products.map((p) => Number(p.price || 0)));
  const force = String(process.env.FORCE_CONVERT_PRICES || "").toLowerCase() === "true";

  // Safety check to prevent accidental repeated conversion.
  if (!force && maxPrice <= 2000) {
    console.log(
      "Conversion skipped: max product price is already low (<= 2000). " +
        "Set FORCE_CONVERT_PRICES=true to override."
    );
    return;
  }

  const ops = products.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { price: toEur(p.price, rate) } },
    },
  }));

  const result = await Product.bulkWrite(ops);
  console.log(
    `Converted ${result.modifiedCount || 0} product prices from INR to EUR at rate 1 EUR = ${rate} INR`
  );
}

run()
  .catch((err) => {
    console.error("Price conversion failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
