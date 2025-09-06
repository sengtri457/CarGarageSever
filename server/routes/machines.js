const express = require("express");
const router = express.Router();
const Machine = require("../models/Machine");

router.get("/test", (req, res) => {
  res.json({ message: "Machines route works!" });
});

// Create a machine
router.post("/", async (req, res) => {
  try {
    const machine = await Machine.create(req.body);
    res.json(machine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
