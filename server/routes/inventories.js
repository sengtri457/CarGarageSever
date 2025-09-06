const routerFactory = require("./crudFactory");
const PartInventory = require("../models/PartInventory");

const router = routerFactory(PartInventory);

// 🔧 Adjust stock with reason
router.post("/:id/adjust", async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const inv = await PartInventory.findById(req.params.id);
    if (!inv)
      return res.status(404).json({ message: "Inventory item not found" });

    inv.quantity += amount;
    inv.lastUpdated = new Date();

    // Optional: log adjustments separately
    if (!inv.adjustments) inv.adjustments = [];
    inv.adjustments.push({ amount, reason, date: new Date() });

    await inv.save();
    res.json(inv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
