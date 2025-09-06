const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const VehicleSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    vin: { type: String, unique: true }, // Vehicle Identification Number
    licensePlate: { type: String },
    mileage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Vehicle", VehicleSchema, "vehicles");
