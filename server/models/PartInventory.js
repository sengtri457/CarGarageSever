const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const RestockSchema = new Schema({
  date: { type: Date, required: true },
  quantity: { type: Number, required: true },
  supplier: { type: String },
  note: { type: String },
});

const PartInventorySchema = new Schema(
  {
    partId: { type: Schema.Types.ObjectId, ref: "Part", required: true },
    quantityInStock: { type: Number, default: 0 },
    location: { type: String, default: "Main Warehouse" },
    restockHistory: [RestockSchema],
    lastUpdated: { type: Date, default: Date.now },
    batchNo: { type: String },
    qtyReserved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("PartInventory", PartInventorySchema, "partInventory");
