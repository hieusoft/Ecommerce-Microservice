const BasePaymentProvider = require("./BasePaymentProvider");
const axios = require("axios");
const crypto = require("crypto");

class OxaPayProvider extends BasePaymentProvider {
  getProviderName() {
    return "oxapay";
  }

  // =====================================================
  // 1. TẠO PAYMENT OXAPAY
  // =====================================================
  async createPayment(order) {
    try {
      const url = String(process.env.OXAPAY_URL);

      const data = {
        amount: order.amount,
        currency: "VND",
        lifetime: 30,
        fee_paid_by_payer: 1,
        under_paid_coverage: 2.5,
        to_currency: "USDT",
        auto_withdrawal: false,
        mixed_payment: true,
        callback_url: String(process.env.OXAPAY_CALLBACK_URL),
        return_url: String(process.env.OXAPAY_REDIRECT_URL),
        email:String(process.env.OXAPAY_EMAIL),
        order_id: "ORD-OXAPAY" + order.orderId,
        thanks_message: "Cảm ơn bạn đã thanh toán!",
        description: "Order #" + order.orderId,
        sandbox:false
      };

      const headers = {
        "merchant_api_key": String(process.env.OXAPAY_API_KEY),
        "Content-Type": "application/json",
      };

      const response = await axios.post(url, data, { headers });
      console.log(response.data)
      if (!response.data || !response.data.data.payment_url) {
        throw new Error("OxaPay response invalid!");
      }

      return {
        url: response.data.data.payment_url,
        providerOrderId: "ORD-" + order.orderId,
      };

    } catch (error) {
      console.error("OxaPay error:", error);
      throw new Error("Cannot create OxaPay payment");
    }
  }


  async handleCallback(data) {
    
    
    const secret = String(process.env.OXAPAY_API_KEY);

    const rawString = data.order_id + data.status + secret;
    const validSignature =
      crypto.createHash("sha256").update(rawString).digest("hex") ===
      data.signature;

    return {
      isValid: validSignature,
      orderId: data.order_id,
      status:
        data.status === "Paid" && validSignature
          ? "SUCCESS"
          : "FAILED",
      raw: data,
    };
  }
}

module.exports = OxaPayProvider;
