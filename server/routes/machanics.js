const router = require("express").Router();
const Mechanic = require("../models/Machanic");

// GET /mechanics - list all mechanics
router.get("/", async (req, res, next) => {
  try {
    const mechanics = await Mechanic.find().sort({ firstName: 1 });
    res.json(mechanics);
  } catch (err) {
    next(err);
  }
});

// GET /mechanics/:id - get a single mechanic
router.get("/:id", async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });
    res.json(mechanic);
  } catch (err) {
    next(err);
  }
});

// POST /mechanics - create a new mechanic
router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, experienceYears, phone, email } = req.body;
    const mechanic = await Mechanic.create({
      firstName,
      lastName,
      experienceYears,
      phone,
      email,
    });
    res.status(201).json(mechanic);
  } catch (err) {
    next(err);
  }
});

// PUT /mechanics/:id - update a mechanic
router.put("/:id", async (req, res, next) => {
  try {
    const update = req.body;
    const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });
    res.json(mechanic);
  } catch (err) {
    next(err);
  }
});

// DELETE /mechanics/:id - remove a mechanic
router.delete("/:id", async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });
    res.json({ message: "Mechanic deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
