const BasePaymentProvider = require("./BasePaymentProvider");
const axios = require("axios");

class OxaPayProvider extends BasePaymentProvider {
    getProviderName() {
        return "oxapay";
    }

    async createPayment(order) {
       
        return {
            payUrl: "https://oxapay.com/pay?order=" + order.orderId
        };
    }

    async handleCallback(data) {
        // TODO: verify signature
        return {
            orderId: data.orderId,
            status: data.status === "success" ? "SUCCESS" : "FAILED"
        };
    }
}

module.exports = OxaPayProvider;
