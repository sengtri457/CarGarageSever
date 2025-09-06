const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const MechanicSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    phone: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Mechanic", MechanicSchema, "mechanics");
