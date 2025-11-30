const PaymentService = require("../services/PaymentService");

class PaymentController {
    async createPayment(req, res) {
        console.log("Received create payment request:", req.body);
        try {
            const { provider, orderId, amount, currency, description } = req.body;
            const payUrl = await PaymentService.createPayment({ provider, orderId, amount, currency, description });
            res.json({ payUrl });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async handleMomoCallback(req, res) {
        const data = req.body;
        const result = await PaymentService.handleCallback("momo", data);
        res.json(result);
    }

    async handleOxaPayCallback(req, res) {
        const data = req.body;
        const result = await PaymentService.handleCallback("oxapay", data);
        res.json(result);
    }
}

module.exports = new PaymentController();
