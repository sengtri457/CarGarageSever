const routerFactory = require("./crudFactory");
const Part = require("../models/Part");

const router = routerFactory(Part);

// 🔎 Low stock alert
router.get("/low-stock", async (req, res, next) => {
  try {
    const lowStockParts = await Part.find({
      $expr: { $lt: ["$stock", "$minStock"] },
    });
    res.json(lowStockParts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
