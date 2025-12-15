const PaymentService = require("../services/PaymentService");
const { getUserFromToken } = require("../services/jwtUserService");

function getAuthUser(req, res) {
  try {
    return getUserFromToken(req);
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
}

class PaymentController {
  redirectToFrontend = (res, result) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (result?.success && result.status === "SUCCESS") {
      const params = new URLSearchParams({
        status: result.status,
        method: result.paymentMethod,
        amount: String(result.amount ?? ""),
        currency: result.currency || "VND",
      });

      return res.redirect(
        `${frontendUrl}/checkout/thankyou/${result.orderId}?${params.toString()}`
      );
    }
    return res.redirect(
      `${frontendUrl}/checkout/failed/${result?.orderId ?? ""}`
    );
  };

  createPayment = async (req, res) => {
    try {
      const {
        provider,
        orderId,
        amount,
        currency,
        converted_amount,
        description,
      } = req.body;

      const payUrl = await PaymentService.createPayment({
        provider,
        orderId,
        amount,
        currency,
        converted_amount,
        description,
      });

      return res.json({ payUrl });
    } catch (err) {
      console.error("❌ createPayment error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  handleVnPayCallback = async (req, res) => {
    try {
      const data = { ...req.query };
      const result = await PaymentService.handleCallback("vnpay", data);
      return this.redirectToFrontend(res, result);
    } catch (err) {
      console.error("❌ handleVnPayCallback error:", err);
      return this.redirectToFrontend(res, null);
    }
  };

  handleMomoCallback = async (req, res) => {
    try {
      const data = { ...req.query };
      const result = await PaymentService.handleCallback("momo", data);
      return this.redirectToFrontend(res, result);
    } catch (err) {
      console.error("❌ handleMomoCallback error:", err);
      return this.redirectToFrontend(res, null);
    }
  };

  handleOxaPayCallback = async (req, res) => {
    try {
      const data = req.body;
      const result = await PaymentService.handleCallback("oxapay", data);
      return this.redirectToFrontend(res, result);
    } catch (err) {
      console.error("❌ handleOxaPayCallback error:", err);
      return this.redirectToFrontend(res, null);
    }
  };

  getPaymentByOrderId = async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const user = getAuthUser(req, res);
      if (!user) return;

      const { userId } = user;
      const paymentRecord = await PaymentService.findPaymentByOrderId(orderId);

      if (!paymentRecord) {
        return res.status(404).json({ error: "Payment record not found" });
      }

      if (paymentRecord.user_id !== Number(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      return res.json({
        success: true,
        paymentUrl: paymentRecord.payment_url,
        providerOrderId: paymentRecord.provider_order_id,
        status: paymentRecord.status,
      });
    } catch (err) {
      console.error("❌ getPaymentByOrderId error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  getStatusByProviderOrderId = async (req, res) => {
    try {
      const { providerOrderId } = req.params;
      const status = await PaymentService.getStatusByProviderOrderId(
        providerOrderId
      );
      return res.json({ status });
    } catch (err) {
      console.error("❌ getStatusByProviderOrderId error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  getAllPayments = async (req, res) => {
    try {
      const user = getAuthUser(req, res);
      if (!user) return;

      const { roles } = user;
      if (!roles.includes("Admin")) {
        return res.status(403).json({ error: "Access denied" });
      }

      const payments = await PaymentService.getAllPayments(req.query);
      res.json(payments);
    } catch (err) {
      console.error("❌ getAllPayments error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  getPaymentsByProvider = async (req, res) => {
    try {
      const { provider } = req.params;
      const payments = await PaymentService.getPaymentsByProvider(provider);
      res.json(payments);
    } catch (err) {
      console.error("❌ getPaymentsByProvider error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  retryPayment = async (req, res) => {
    try {
      const user = getAuthUser(req, res);
      if (!user) return;

      const { userId } = user;
      const { orderId, provider } = req.params;

      const paymentRecord = await PaymentService.findPaymentByOrderId(
        Number(orderId)
      );

      if (!paymentRecord) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (paymentRecord.user_id !== Number(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const paymentUrl = await PaymentService.retryPayment(orderId, provider);
      res.json({ paymentUrl });
    } catch (err) {
      console.error("❌ retryPayment error:", err);
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = new PaymentController();
