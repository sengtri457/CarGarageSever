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
    quantity: Number,
    pricePerUnit: Number,
    location: String,
  },
  { _id: false }
);

const MachineSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Machine" },
    name: String,
    model: String,
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

const RepairOrderSchema = new Schema(
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

module.exports = model("RepairOrder", RepairOrderSchema, "repairOrders");
