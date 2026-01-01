// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connect = require("./lib/db");

const app = express();

/* =======================
   ENV VALIDATION
======================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

if (!process.env.PORT) {
  process.env.PORT = 10000; // Render default
}

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Welcome to CarGarage API");
});

/* =======================
   ROUTES
======================= */
app.use("/api/customers", require("./routes/customers"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/parts", require("./routes/parts"));
app.use("/api/inventories", require("./routes/inventories"));
app.use("/api/services", require("./routes/services"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/machines", require("./routes/machines"));
app.use("/api/mechanics", require("./routes/machanics"));
app.use("/api/repairs", require("./routes/repairs"));
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* =======================
   START SERVER
======================= */
(async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();
