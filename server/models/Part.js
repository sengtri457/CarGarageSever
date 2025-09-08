// Part Schema (Fixed)
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PartSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    unitPrice: { type: Number, required: true }, // Fixed: removed 'a' typo
    unit: { type: String, default: "pcs" },
    qtyStock: { type: Number, default: 0 },
    manufacturer: String,
  },
  { timestamps: true }
);

module.exports = model("Part", PartSchema);
