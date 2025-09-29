const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const LineServiceSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    price: Number,
  },
  { _id: false }
);

const LinePartSchema = new Schema(
  {
    partId: { type: Schema.Types.ObjectId, ref: "Part" },
    quantity: { type: Number, required: true },
    pricePerUnit: Number,
    location: String,
  },
  { _id: false }
);

const MachineSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Machine" },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true },
    serialNo: { type: String, required: true },
    VehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance"],
      default: "available",
    },
    maintenanceLog: [
      {
        _id: false,
        date: { type: Date, required: true },
        performedBy: { type: String, required: true },
        notes: String,
      },
    ],
  },
  { _id: false }
);

const MechanicSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Mechanic" },
    name: String,
    experienceYears: Number,
    contact: String,
  },
  { _id: false }
);

const RepairSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerSnapshot: { name: String, phone: String },
    vehicleSnapshot: {
      vin: String,
      plate: String,
      make: String,
      model: String,
      year: Number,
    },

    servicesPerformed: [LineServiceSchema],
    partsUsed: [LinePartSchema],
    machineUsed: MachineSchema,
    mechanic: MechanicSchema,

    date: { type: Date, default: Date.now },
    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "open",
        "in-progress",
        "done",
        "invoiced",
        "paid",
        "cancelled",
        "completed",
      ],
      default: "open",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = model("Repair", RepairSchema, "repairs");
