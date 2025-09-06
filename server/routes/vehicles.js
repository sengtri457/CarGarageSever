const routerFactory = require("./crudFactory");
const Vehicle = require("../models/Vehicle");
const RepairOrder = require("../models/RepairOrder");

const router = routerFactory(Vehicle);

// Extra: repair history
router.get("/:id/repair-history", async (req, res, next) => {
  try {
    const history = await RepairOrder.find({ vehicleId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// Extra: mileage update
router.post("/:id/add-mileage", async (req, res, next) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Vehicle not found" });
    v.mileage += req.body.miles;
    await v.save();
    res.json(v);
  } catch (err) {
    next(err);
  }
});
app.get("/vehicles", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (search) {
      // Case-insensitive partial match for model field only
      const regex = new RegExp(search, "i");
      filter.model = regex;
    }

    const vehicles = await Vehicle.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Vehicle.countDocuments(filter);

    res.json({ data: vehicles, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
