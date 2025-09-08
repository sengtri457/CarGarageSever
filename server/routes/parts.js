const routerFactory = require("./crudFactory");
const Part = require("../models/Part");
const PartInventory = require("../models/PartInventory");

const router = routerFactory(Part);

// 🔎 Low stock alert
router.get("/low-stock", async (req, res, next) => {
  try {
    const lowStockParts = await Part.aggregate([
      {
        $lookup: {
          from: "partInventory",
          localField: "_id",
          foreignField: "partId",
          as: "inventory",
        },
      },
      { $unwind: "$inventory" },
      {
        $match: {
          $expr: { $lt: ["$inventory.quantityInStock", "$minStock"] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          minStock: 1,
          quantityInStock: "$inventory.quantityInStock",
        },
      },
    ]);

    res.json(lowStockParts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
