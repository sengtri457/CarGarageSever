// routes/crudFactory.js
const express = require("express");

const routerFactory = (Model) => {
  const router = express.Router();

  // Create
  router.post("/", async (req, res, next) => {
    try {
      res.status(201).json(await Model.create(req.body));
    } catch (err) {
      next(err);
    }
  });

  // Read all (with search + pagination + filter)
  router.get("/", async (req, res, next) => {
    try {
      let { page = 1, limit = 10, search, ...filters } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      const query = {};

      // Apply filters (exact match)
      Object.keys(filters).forEach((key) => {
        query[key] = filters[key];
      });

      // Search across string fields
      if (search) {
        const schemaPaths = Object.keys(Model.schema.paths).filter(
          (p) => Model.schema.paths[p].instance === "String"
        );
        if (schemaPaths.length > 0) {
          query["$or"] = schemaPaths.map((f) => ({
            [f]: { $regex: search, $options: "i" },
          }));
        }
      }

      const total = await Model.countDocuments(query);
      const docs = await Model.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: docs,
      });
    } catch (err) {
      next(err);
    }
  });

  // Read one
  router.get("/:id", async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  });

  // Update
  router.put("/:id", async (req, res, next) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // Delete
  router.delete("/:id", async (req, res, next) => {
    try {
      const deleted = await Model.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

module.exports = routerFactory;
