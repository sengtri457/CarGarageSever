const routerFactory = require("./crudFactory");
const Service = require("../models/Service");

const router = routerFactory(Service);

router.get("/by-category/:categoryId", async (req, res, next) => {
  try {
    const services = await Service.find({ categoryId: req.params.categoryId });
    res.json(services);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
