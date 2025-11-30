const BasePaymentProvider = require("./BasePaymentProvider");
const axios = require("axios");
const crypto = require("crypto");

class MomoProvider extends BasePaymentProvider {
    getProviderName() {
        return "momo";
    }

    async createPayment(order) {
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = "payWithMethod";
        const amount = order.amount.toString();
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const extraData = "";
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${order.description}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac("sha256", secretKey)
            .update(rawSignature)
            .digest("hex");

        const requestBody = {
            partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId,
            amount,
            orderId,
            orderInfo: order.description,
            redirectUrl,
            ipnUrl,
            lang: "vi",
            requestType,
            autoCapture: true,
            extraData,
            orderGroupId: "",
            signature
        };

     
        try {
            const res = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("MoMo API response:", res.data);

            return {
                url: res.data.payUrl, 
                momoOrderId: orderId
            };
        } catch (err) {
            console.error("MoMo payment error:", err.response?.data || err.message);
            throw new Error("MoMo payment creation failed");
        }
    }

    async handleCallback(data) {
        return {
            orderId: data.orderId,
            status: data.resultCode === 0 ? "SUCCESS" : "FAILED"
        };
    }
}

module.exports = new MomoProvider();
