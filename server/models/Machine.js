const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const MachineSchema = new Schema(
  {
    _id: { type: String, required: true }, // e.g., "mach001"
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
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
  { timestamps: true }
);

module.exports = model("Machine", MachineSchema, "machines");
