const PaymentService = require("../services/PaymentService");
const { getUserFromToken } = require("../services/jwtUserService");

class PaymentController {
  async createPayment(req, res) {
    try {
      console.log("Received create payment request:", req.body);
      const { provider, orderId, amount, currency, converted_amount, description } = req.body;
      const payUrl = await PaymentService.createPayment({
        provider,
        orderId,
        amount,
        currency,
        converted_amount,
        description,
      });
      res.json({ payUrl });
    } catch (err) {
      console.error("❌ createPayment error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async handleVnPayCallback(req, res) {
    try {
      const data = JSON.parse(JSON.stringify(req.query));
      const result = await PaymentService.handleCallback("vnpay", data);
      res.json(result);
    } catch (err) {
      console.error("❌ handleVnPayCallback error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async handleMomoCallback(req, res) {
    try {
      const data = req.body;
      const result = await PaymentService.handleCallback("momo", data);
      res.json(result);
    } catch (err) {
      console.error("❌ handleMomoCallback error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async handleOxaPayCallback(req, res) {
    try {
      const data = req.body;
      const result = await PaymentService.handleCallback("oxapay", data);
      res.json(result);
    } catch (err) {
      console.error("❌ handleOxaPayCallback error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async getPaymentByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const paymentRecord = await PaymentService.findPaymentByOrderId(orderId);
      if (!paymentRecord) {
        return res.status(404).json({ error: "Payment record not found" });
      }
      res.json(paymentRecord);
    } catch (err) {
      console.error("❌ getPaymentByOrderId error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async getAllPayments(req, res) {
    try {
      const { userId, roles } = getUserFromToken(req);
      if (!roles.includes("Admin")) {
        return res.status(403).json({ error: "Access denied" });
      }
      const payments = await PaymentService.getAllPayments(req.query);
      res.json(payments);
    } catch (err) {
      console.error("❌ getAllPayments error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async getStatusByProviderOrderId(req, res) {
    try {
      const { providerOrderId } = req.params;
      const status = await PaymentService.getStatusByProviderOrderId(providerOrderId);
      res.json({ status });
    } catch (err) {
      console.error("❌ getStatusByProviderOrderId error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async getPaymentsByProvider(req, res) {
    try {
      const { provider } = req.params;
      const payments = await PaymentService.getPaymentsByProvider(provider);
      res.json(payments);
    } catch (err) {
      console.error("❌ getPaymentsByProvider error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async retryPayment(req, res) {
    try {
      const { orderId, provider } = req.params;
      console.log(`Retrying payment for orderId: ${orderId} with provider: ${provider}`);
      const paymentUrl = await PaymentService.retryPayment(orderId, provider);
      res.json({ paymentUrl });
    } catch (err) {
      console.error("❌ retryPayment error:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PaymentController();
