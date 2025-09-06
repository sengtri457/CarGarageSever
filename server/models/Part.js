const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PartSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    unitPrice: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    minStock: { type: Number, default: 0 },
    manufacturer: String,
  },
  { timestamps: true }
);

module.exports = model("Part", PartSchema, "Part");
