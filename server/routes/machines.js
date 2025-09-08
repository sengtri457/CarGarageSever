const express = require("express");
const router = express.Router();
const Machine = require("../models/Machine");
// GET /machines/:id
router.get("/:id", async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json(machine);
  } catch (err) {
    next(err);
  }
});

// GET all machines
router.get("/", async (req, res, next) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (err) {
    next(err);
  }
});
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
