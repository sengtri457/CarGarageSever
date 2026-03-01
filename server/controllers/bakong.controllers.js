// controllers/bakong.controllers.js
const axios = require("axios");
const {v4: uuidv4} = require("uuid");
const {generateQR} = require("../utils/bakong");
const BakongSession = require("../models/BakongSession");
const RepairOrder = require("../models/RepairOrder");

/**
 * POST /api/bakong/generate
 * Body: { repairOrderId }
 * Generates QR for an EXISTING saved repair order.
 */
async function generateQRCode(req, res, next) {
    try {
        const {repairOrderId} = req.body;
        if (!repairOrderId) 
            return res.status(400).json({message: "repairOrderId is required"});
        

        const order = await RepairOrder.findById(repairOrderId);
        if (! order) 
            return res.status(404).json({message: "Repair order not found"});
        
        if (order.status === "paid") 
            return res.status(400).json({message: "This repair order is already paid."});
        

        const amount = order.totalCost;
        if (! amount || amount <= 0) 
            return res.status(400).json({message: "Repair order total cost must be greater than 0."});
        

        await BakongSession.updateMany({
            repairOrderId: order._id,
            status: "pending"
        }, {status: "cancelled"});

        const {qrString, md5} = generateQR(amount, order.number);
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await BakongSession.create({
            sessionId,
            repairOrderId: order._id,
            repairOrderNumber: order.number,
            amount,
            currency: "usd",
            qrString,
            md5,
            expiresAt
        });

        return res.status(200).json({
            sessionId,
            qrString,
            md5,
            amount,
            currency: "usd",
            orderNumber: order.number,
            expiresAt
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/bakong/generate-preview
 * Body: { amount, billRef }
 * Generates a KHQR for a NOT-YET-SAVED repair order (payment-first flow).
 * No repairOrderId needed — we store a temporary session without linking.
 */
async function generatePreviewQRCode(req, res, next) {
    try {
        const {amount, billRef} = req.body;
        if (!amount || amount <= 0) 
            return res.status(400).json({message: "amount must be greater than 0"});
        

        const bill = billRef || `PREVIEW-${
            Date.now()
        }`;
        const {qrString, md5} = generateQR(amount, bill);
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store session without a repairOrderId — uses a placeholder ObjectId sentinel
        await BakongSession.create({
            sessionId,
            repairOrderId: new(require("mongoose").Types.ObjectId)(), // temp placeholder
            repairOrderNumber: bill,
            amount,
            currency: "usd",
            qrString,
            md5,
            expiresAt
        });

        return res.status(200).json({
            sessionId,
            qrString,
            md5,
            amount,
            currency: "usd",
            orderNumber: bill,
            expiresAt
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/bakong/check
 * Body: { sessionId }
 * Polls Bakong API to check payment. If paid — marks session as paid.
 * Does NOT create a repair order (that is done by the frontend after confirmation).
 */
async function checkPaymentStatus(req, res, next) {
    try {
        const {sessionId} = req.body;
        if (!sessionId) 
            return res.status(400).json({message: "sessionId is required"});
        

        const session = await BakongSession.findOne({sessionId});
        if (! session) 
            return res.status(404).json({message: "Session not found"});
        

        if (session.status === "paid") 
            return res.json({isPaid: true, message: "Payment already confirmed."});
        

        if (session.status === "expired" || new Date() > session.expiresAt) {
            session.status = "expired";
            await session.save();
            return res.json({isPaid: false, message: "QR code has expired."});
        }

        // Poll Bakong API
        const bakongApiUrl = process.env.BAKONG_API_URL || "https://api-bakong.nbc.gov.kh";
        const token = process.env.BAKONG_TOKEN;

        const bakongRes = await axios.post(`${bakongApiUrl}/v1/check_transaction_by_md5`, {
            md5: session.md5
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            timeout: 8000
        });

        const data = bakongRes.data;
        const isPaid = data ?. responseCode === 0 && (data ?. data ?. status === "SUCCESS" || data ?. data ?. hash);

        if (isPaid) {
            session.status = "paid";
            await session.save();

            // Only mark the linked repair order as paid if it exists and was pre-saved
            if (session.repairOrderNumber && ! session.repairOrderNumber.startsWith("PREVIEW-")) {
                await RepairOrder.findByIdAndUpdate(session.repairOrderId, {status: "paid"});
            }

            return res.json({isPaid: true, message: "Payment confirmed!"});
        }

        return res.json({isPaid: false, message: "Payment not yet received."});
    } catch (err) {
        if (err.response && err.response.status !== 200) 
            return res.json({isPaid: false, message: "Payment not yet received."});
        
        next(err);
    }
}

module.exports = {
    generateQRCode,
    generatePreviewQRCode,
    checkPaymentStatus
};
