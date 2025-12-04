const PaymentService = require("../services/PaymentService");

class PaymentController {
    async createPayment(req, res) {
        console.log("Received create payment request:", req.body);
        try {
            const { provider, orderId, amount, currency,converted_amount, description } = req.body;
            const payUrl = await PaymentService.createPayment({ provider, orderId, amount, currency, converted_amount,description });
            res.json({ payUrl });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
    async handleVnPayCallback(req, res) {
        
           const data = JSON.parse(JSON.stringify(req.query));
            const result = await PaymentService.handleCallback("vnpay", data);
            res.json(result);
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
    async getPaymentByOrderId(req, res) {
        const { orderId } = req.params;
        const paymentRecord = await PaymentService.findPaymentByOrderId(orderId);
        if (!paymentRecord) {
            return res.status(404).json({ error: "Payment record not found" });
        }
        res.json(paymentRecord);
    }
    async getAllPayments(req, res) {
        const payments = await PaymentService.getAllPayments();
        res.json(payments);
    }
    async getStatusByProviderOrderId(req, res) {
        const { providerOrderId } = req.params;
        const status = await PaymentService.getStatusByProviderOrderId(providerOrderId);    
        res.json({ status });
    }
    async getPaymentsByProvider(req, res) {
        const { provider } = req.params;
        const payments = await PaymentService.getPaymentsByProvider(provider);
        res.json(payments);
    }
   
}

module.exports = new PaymentController();
