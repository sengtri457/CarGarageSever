const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CustomerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    zip: { type: String },
  },
  vehiclesOwned: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
});

module.exports = mongoose.model("Customer", CustomerSchema);
