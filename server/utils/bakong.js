// utils/bakong.js
const {BakongKHQR, khqrData, IndividualInfo} = require("bakong-khqr");

/**
 * Generate a Bakong KHQR string for an amount in USD.
 *
 * IndividualInfo(bakongAccountID, merchantName, merchantCity, optional)
 *   - merchantCity  → 3rd positional arg (NOT inside optional)
 *   - generateIndividual() is an INSTANCE method, not static
 *   - expirationTimestamp is REQUIRED when amount is set (dynamic KHQR)
 *
 * @param {number} amount  - Amount in USD  (e.g. 25.50)
 * @param {string} bill    - Order number   (e.g. "RO-1234567890")
 * @returns {{ qrString: string, md5: string }}
 */
function generateQR(amount, bill) { // ── Positional args — must be plain strings ──────────────────────────
    const bakongAccountID = String(process.env.BAKONG_ACCOUNT_ID || "bun_sengtri@bkrt");
    const merchantName = String(process.env.BAKONG_MERCHANT_NAME || "Bun Seng Tri");
    const merchantCity = String(process.env.BAKONG_CITY || "Phnom Penh");

    // ── Optional 4th-arg object ──────────────────────────────────────────
    // expirationTimestamp is REQUIRED for dynamic KHQR (when amount is present)
    const expirationTimestamp = (Date.now() + 15 * 60 * 1000).toString(); // Unix ms

    const optional = {
        currency: khqrData.currency.usd,
        amount: amount,
        mobileNumber: String(process.env.BAKONG_MOBILE || "85599706869"),
        billNumber: String(bill),
        expirationTimestamp: expirationTimestamp
    };

    const individual = new IndividualInfo(bakongAccountID, merchantName, merchantCity, // 3rd positional arg
    optional);

    // generateIndividual is an INSTANCE method
    const bakong = new BakongKHQR();
    const khqr = bakong.generateIndividual(individual);

    if (! khqr || ! khqr.data) {
        throw new Error("KHQR generation failed: " + JSON.stringify(khqr));
    }

    return {qrString: khqr.data.qr, md5: khqr.data.md5};
}

module.exports = {
    generateQR
};
