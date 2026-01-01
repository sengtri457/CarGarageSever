// lib/db.js
const mongoose = require("mongoose");

module.exports = async (uri) => {
  if (!uri) throw new Error("MongoDB URI is empty");

  mongoose.connection.on("connected", () => {
    console.log("📦 MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB error:", err.message);
  });

  return mongoose.connect(uri);
};
