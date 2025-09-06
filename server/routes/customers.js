const routerFactory = require("./crudFactory");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const RepairOrder = require("../models/RepairOrder");

const router = routerFactory(Customer);

// Extra routes
router.get("/:id/vehicles", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ customerId: req.params.id });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/repair-orders", async (req, res, next) => {
  try {
    const orders = await RepairOrder.find({ customerId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
