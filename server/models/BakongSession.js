// models/BakongSession.js
const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const BakongSessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    }, // uuid-v4
    repairOrderId: {
        type: Schema.Types.ObjectId,
        ref: "RepairOrder",
        required: true
    },
    repairOrderNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }, // USD amount
    currency: {
        type: String,
        default: "usd"
    },
    qrString: {
        type: String,
        required: true
    },
    md5: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            "pending", "paid", "expired", "cancelled"
        ],
        default: "pending"
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    }
}, {timestamps: true});

// MongoDB TTL index — auto-deletes documents 0 seconds after expiresAt
BakongSessionSchema.index({
    expiresAt: 1
}, {expireAfterSeconds: 0});

module.exports = model("BakongSession", BakongSessionSchema, "bakong_sessions");
