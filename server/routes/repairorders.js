const router = require("express").Router();
const mongoose = require("mongoose");
const RepairOrder = require("../models/RepairOrder");
const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");
const Part = require("../models/Part");
const PartInventory = require("../models/PartInventory");
const Service = require("../models/Service");
const Machine = require("../models/Machine");
const Mechanic = require("../models/Machanic");

// POST /repair-orders
router.post("/", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      vehicleId,
      servicesPerformed = [],
      partsUsed = [],
      machineUsed,
      mechanic,
      notes,
      status = "open",
    } = req.body;

    // Validate vehicle and customer
    const vehicle = await Vehicle.findById(vehicleId).session(session);
    if (!vehicle)
      throw Object.assign(new Error("Vehicle not found"), { status: 404 });

    const customer = await Customer.findById(vehicle.customerId).session(
      session
    );
    if (!customer)
      throw Object.assign(new Error("Customer not found"), { status: 404 });

    // Process services
    const serviceLines = [];
    for (const s of servicesPerformed) {
      const svc = await Service.findById(s.serviceId).session(session);
      if (!svc)
        throw Object.assign(new Error("Service not found"), { status: 400 });

      serviceLines.push({
        serviceId: svc._id,
        price: s.price ?? svc.basePrice,
      });
    }

    // Process parts
    const partLines = [];
    for (const p of partsUsed) {
      const part = await Part.findById(p.partId).session(session);
      if (!part)
        throw Object.assign(new Error("Part not found"), { status: 400 });

      const inv = await PartInventory.findOne({
        partId: part._id,
        location: p.location || "main",
      }).session(session);

      if (!inv || inv.qtyOnHand < p.quantity)
        throw Object.assign(new Error(`Insufficient stock for ${part.name}`), {
          status: 400,
        });

      // Adjust inventory
      inv.qtyOnHand -= p.quantity;
      inv.qtyReserved += p.quantity;
      await inv.save({ session });

      partLines.push({
        partId: part._id,
        quantity: p.quantity,
        pricePerUnit: p.pricePerUnit ?? part.unitPrice,
        location: p.location || "main",
      });
    }

    // Calculate totalCost
    const serviceTotal = serviceLines.reduce((sum, s) => sum + s.price, 0);
    const partsTotal = partLines.reduce(
      (sum, p) => sum + p.pricePerUnit * p.quantity,
      0
    );
    const totalCost = serviceTotal + partsTotal;

    // Create order
    const order = await RepairOrder.create(
      [
        {
          number: `RO-${Date.now()}`,
          vehicleId: vehicle._id,
          customerId: customer._id,
          customerSnapshot: {
            name: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
          },
          vehicleSnapshot: {
            vin: vehicle.vin,
            plate: vehicle.plate,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
          },
          servicesPerformed: serviceLines,
          partsUsed: partLines,
          machineUsed, // expected as { id, name, model }
          mechanic, // expected as { id, name, experienceYears, contact }
          totalCost,
          status,
          notes,
          date: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

// GET /repair-orders/by-customer/:customerId
router.get("/by-customer/:customerId", async (req, res, next) => {
  try {
    const orders = await RepairOrder.find({
      customerId: req.params.customerId,
    }).sort({ date: -1 }); // sort by custom date
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
