const router = require("express").Router();
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");
const Part = require("../models/Part");
const PartInventory = require("../models/PartInventory");
const Service = require("../models/Service");
const Machine = require("../models/Machine");
const Mechanic = require("../models/Machanic");
const RepairOrder = require("../models/RepairOrder");

// GET all repair orders
router.get("/", async (req, res, next) => {
  try {
    const orders = await RepairOrder.find()
      .populate("vehicleId")
      .populate("customerId")
      .populate("mechanicId")
      .populate("machineUsed")
      .populate("servicesPerformed.serviceId")
      .populate("partsUsed.partId");
    res.json(orders);
  } catch (err) {
    next(err);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const sort = req.query.sort === "asc" ? 1 : -1;
    const search = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      filter = {
        $or: [
          { "customerSnapshot.name": regex },
          { number: regex },
          { "vehicleSnapshot.plate": regex },
        ],
      };
    }

    const orders = await RepairOrder.find(filter).sort({ date: sort });
    console.log(res);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET one repair order by ID
router.get("/:id", async (req, res, next) => {
  try {
    const order = await RepairOrder.findById(req.params.id)
      .populate("vehicleId")
      .populate("customerId")
      .populate("mechanicId")
      .populate("machineUsed")
      .populate("servicesPerformed.serviceId")
      .populate("partsUsed.partId");

    if (!order)
      return res.status(404).json({ message: "Repair order not found" });

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /repair-orders
router.post("/", async (req, res, next) => {
  try {
    const {
      vehicleId,
      customerId,
      servicesPerformed = [],
      partsUsed = [],
      machineUsed,
      mechanicId,
      notes,
      status = "open",
    } = req.body;
    console.log("REQ BODY:", req.body);

    // --- Validate Vehicle & Customer ---
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // --- Validate Mechanic ---
    let mechanic = null;
    if (mechanicId) {
      mechanic = await Mechanic.findById(mechanicId);
      if (!mechanic)
        return res.status(404).json({ message: "Mechanic not found" });
    }

    // --- Validate Machine ---
    // --- Validate Machine ---
    let machineDoc = null;
    if (machineUsed && machineUsed !== "") {
      // ✅ skip empty string
      machineDoc = await Machine.findById(machineUsed);
      if (!machineDoc) {
        return res.status(404).json({ message: "Machine not found" });
      }
    }

    // --- Process Services ---
    const serviceLines = [];
    for (const s of servicesPerformed) {
      const svc = await Service.findById(s.serviceId);
      if (!svc)
        return res
          .status(400)
          .json({ message: `Service not found: ${s.serviceId}` });
      serviceLines.push({
        serviceId: svc._id,
        price: s.price ?? svc.basePrice,
      });
    }

    // --- Process Parts ---
    const partLines = [];
    for (const p of partsUsed) {
      const part = await Part.findById(p.partId);
      if (!part)
        return res.status(400).json({ message: `Part not found: ${p.partId}` });
      partLines.push({
        partId: part._id,
        quantity: Number(p.quantity) || 0,
        pricePerUnit: p.pricePerUnit ?? part.unitPrice,
        location: p.location || "Main Warehouse",
      });
    }

    // --- Totals ---
    const serviceTotal = serviceLines.reduce((sum, s) => sum + s.price, 0);
    const partsTotal = partLines.reduce(
      (sum, p) => sum + p.pricePerUnit * p.quantity,
      0
    );
    const totalCost = serviceTotal + partsTotal;
    const orderData = {
      number: `RO-${Date.now()}`,
      vehicleId: vehicle._id,
      customerId: customer._id,
      mechanicId: mechanic?._id || null,
      machineUsed: machineUsed || null,
      customerSnapshot: {
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        email: customer.email,
      },
      vehicleSnapshot: {
        vin: vehicle.vin,
        plate: vehicle.licensePlate,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
      },
      mechanicSnapshot: mechanic
        ? {
            firstName: mechanic.firstName,
            lastName: mechanic.lastName,
            phone: mechanic.phone,
            experienceYears: mechanic.experienceYears,
          }
        : undefined,
      // machineSnapshot: machineDoc ? machineDoc.toObject() : undefined,
      machineSnapshot: machineDoc
        ? {
            _id: machineDoc._id,
            name: machineDoc.name,
            serialNo: machineDoc.serialNo,
            brand: machineDoc.brand,
            model: machineDoc.model,
            type: machineDoc.type,
            VehicleId: machineDoc.VehicleId,
            lastServiceAt: machineDoc.lastServiceAt,
            active: machineDoc.active,
          }
        : undefined,
      servicesPerformed: serviceLines,
      partsUsed: partLines,
      totalCost,
      status,
      notes,
      date: new Date(),
    };

    const order = await RepairOrder.create(orderData);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});
// DELETE repair order
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await RepairOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT / update repair order
router.put("/:id", async (req, res) => {
  try {
    const updated = await RepairOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
