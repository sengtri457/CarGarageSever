// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connect = require("./lib/db");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Welcome to CarGarage API");
});

// API routes
app.use("/api/customers", require("./routes/customers"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/parts", require("./routes/parts"));
app.use("/api/inventories", require("./routes/inventories"));
app.use("/api/services", require("./routes/services"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/machines", require("./routes/machines"));
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/api/mechanics", require("./routes/machanics"));
app.use("/api/repairs", require("./routes/repairs"));
// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

// Connect DB and start server
connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`API running on port ${process.env.PORT}`),
    ),
  )
  .catch((err) => {
    console.error("DB connect failed", err);
    process.exit(1);
  });
