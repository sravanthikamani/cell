const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cell";

let connectPromise = null;

function maskMongoUri(uri) {
  if (!uri) return "";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s]+)@/i, "$1***:***@");
}

function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (connectPromise) return connectPromise;

  connectPromise = mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log(`✅ MongoDB connected (${maskMongoUri(MONGODB_URI)})`);
      return mongoose;
    })
    .catch((err) => {
      console.error("❌ MongoDB error:", err.message);
      throw err;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

module.exports = {
  mongoose,
  MONGODB_URI,
  connectDB,
  maskMongoUri,
};
