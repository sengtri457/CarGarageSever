const routerFactory = require("./crudFactory"); // must point to crudFactory.js
const Category = require("../models/category"); // must match the file name exactly

const Service = require("../models/Service");

const router = routerFactory(Category);

// Extra route: get services for a category
router.get("/:id/services", async (req, res, next) => {
  try {
    const services = await Service.find({ categoryId: req.params.id });
    res.json(services);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
