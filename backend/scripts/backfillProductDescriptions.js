require("dotenv").config();
const { connectDB, mongoose } = require("../db");
const Product = require("../models/Product");

function toTitleCase(input) {
  return String(input || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function buildDescription(product) {
  const name = String(product?.name || "Product").trim();
  const brand = toTitleCase(product?.brand || "Hi-Tech");
  const group = toTitleCase(product?.group || "Electronics");
  const type = toTitleCase(product?.type || "Accessories");

  return `${brand} ${name} from our ${group} / ${type} range, built for dependable everyday performance, smooth usage, and long-lasting quality.`;
}

async function run() {
  await connectDB();

  const overwriteAll = String(process.env.OVERWRITE_DESCRIPTIONS || "").toLowerCase() === "true";

  const filter = overwriteAll
    ? {}
    : {
        $or: [
          { description: { $exists: false } },
          { description: null },
          { description: "" },
          { description: { $regex: /^\s*$/ } },
        ],
      };

  const products = await Product.find(filter, {
    _id: 1,
    name: 1,
    brand: 1,
    group: 1,
    type: 1,
    description: 1,
  }).lean();

  if (!products.length) {
    console.log("No products need description updates.");
    return;
  }

  const ops = products.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { description: buildDescription(p) } },
    },
  }));

  const result = await Product.bulkWrite(ops);
  const modified = Number(result?.modifiedCount || 0);
  const matched = Number(result?.matchedCount || 0);

  console.log(
    `Product descriptions updated: modified=${modified}, matched=${matched}, overwriteAll=${overwriteAll}`
  );
}

run()
  .catch((err) => {
    console.error("Description backfill failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
