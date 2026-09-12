const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");

const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);

const db = new Low(adapter, {
  products: [],
  users: [],
  carts: [],
  orders: [],
  addresses: []
});

async function initDB() {
  await db.read();

  db.data ||= {
    products: [],
    users: [],
    carts: [],
    orders: [],
    addresses: []
  };

  await db.write();

  console.log("ZCart database ready!");
}

module.exports = { db, initDB };
