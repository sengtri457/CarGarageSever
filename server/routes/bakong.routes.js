// routes/bakong.routes.js
const router = require("express").Router();
const {generateQRCode, generatePreviewQRCode, checkPaymentStatus} = require("../controllers/bakong.controllers");

// POST /api/bakong/generate         — QR for an existing saved repair order
router.post("/generate", generateQRCode);

// POST /api/bakong/generate-preview — QR before the repair order is saved (payment-first flow)
router.post("/generate-preview", generatePreviewQRCode);

// POST /api/bakong/check            — poll payment status
router.post("/check", checkPaymentStatus);

module.exports = router;
