const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    estimatedTime: {
      minutes: { type: Number, default: 0 },
      difficultyLevel: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
      },
    },
    toolsRequired: { type: [String], default: [] },
    partsRequired: [
      {
        partId: { type: Schema.Types.ObjectId, ref: "Part" },
        quantity: { type: Number, default: 1 },
      },
    ],
    taxable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("Service", ServiceSchema, "services");
