const routerFactory = require("./crudFactory");
const PartInventory = require("../models/PartInventory");

const router = routerFactory(PartInventory);
router.get("/inventories", async (req, res, next) => {
  try {
    console.log("Fetching inventories with population...");
    const inventories = await PartInventory.find()
      .populate({
        path: "partId",
        select: "_id name sku unitPrice unit qtyStock manufacturer",
      })
      .lean() // Optional: for better performance
      .exec();

    console.log("Found inventories:", inventories.length);
    console.log("First inventory partId type:", typeof inventories[0]?.partId);

    // Filter out any where population failed
    const validInventories = inventories.filter(
      (inv) => inv.partId && typeof inv.partId === "object" && inv.partId.name
    );

    console.log("Valid inventories after filtering:", validInventories.length);

    res.json({
      success: true,
      count: validInventories.length,
      data: validInventories,
    });
  } catch (err) {
    console.error("Inventory fetch error:", err);
    next(err);
  }
});

// Fix 4: Alternative population approach
router.get("/inventories-alternative", async (req, res, next) => {
  try {
    // Use aggregate instead of populate (more reliable)
    const inventories = await PartInventory.aggregate([
      {
        $lookup: {
          from: "parts", // Collection name (lowercase, plural)
          localField: "partId",
          foreignField: "_id",
          as: "partDetails",
        },
      },
      {
        $unwind: {
          path: "$partDetails",
          preserveNullAndEmptyArrays: false, // Skip if no matching part
        },
      },
      {
        $addFields: {
          partId: "$partDetails", // Replace partId with full part data
        },
      },
      {
        $project: {
          partDetails: 0, // Remove the temporary field
        },
      },
    ]);

    res.json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (err) {
    console.error("Aggregate error:", err);
    next(err);
  }
});
// Fix 5: Test with a simple query first
router.get("/test-population", async (req, res) => {
  try {
    // Step 1: Get raw data
    const rawInventory = await PartInventory.findOne();
    console.log("Raw inventory partId:", rawInventory?.partId);

    // Step 2: Try to find the referenced part manually
    const referencedPart = await Part.findById(rawInventory?.partId);
    console.log("Referenced part exists:", !!referencedPart);

    // Step 3: Try population
    const populatedInventory = await PartInventory.findOne().populate("partId");

    res.json({
      rawPartId: rawInventory?.partId,
      partExists: !!referencedPart,
      populatedPartId: populatedInventory?.partId,
      populationWorked: !!(
        populatedInventory?.partId &&
        typeof populatedInventory.partId === "object" &&
        populatedInventory.partId.name
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
