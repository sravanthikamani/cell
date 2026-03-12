const mongoose = require("mongoose");
const base = process.env.MONGODB_URI;
const dbs = ["cell","test","admin","sample_mflix","Cluster0","cell-app","cell_app","shop"];

function withDbName(uri, dbName) {
  const withoutQuery = uri.split("?")[0];
  const query = uri.includes("?") ? uri.slice(uri.indexOf("?")) : "";
  const root = withoutQuery.endsWith("/") ? withoutQuery.slice(0, -1) : withoutQuery;
  return `${root}/${dbName}${query}`;
}

(async () => {
  for (const db of dbs) {
    const uri = withDbName(base, db);
    try {
      const conn = await mongoose.createConnection(uri).asPromise();
      const count = await conn.collection("products").countDocuments({});
      console.log(`${db}: products=${count}`);
      await conn.close();
    } catch (e) {
      console.log(`${db}: error=${e.message}`);
    }
  }
})().catch((e) => console.error(e.message));
