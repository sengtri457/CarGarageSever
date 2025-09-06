const { Schema, model } = require("mongoose");

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    kind: { type: String, enum: ["service", "part", "both"], default: "both" },
  },
  { timestamps: true }
);

module.exports = model("Category", CategorySchema, "categories");
