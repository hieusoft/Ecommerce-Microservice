const BasePaymentProvider = require("./BasePaymentProvider");
const axios = require("axios");
const crypto = require("crypto");
const e = require("express");

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

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${order.orderId}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const expireTime = Date.now() + 15 * 60 * 1000;
    const expiresAt = new Date(Date.now() + 105 * 60 * 1000); 

    const requestBody = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo: order.orderId,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      orderGroupId: "",
      signature,
      expireTime,
    };
    console.log("📤 MoMo create payment request:");
    try {
      const res = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("📤 MoMo create payment response:", res.data);
      return {
        url: res.data.payUrl,
        expiresAt: expiresAt,
        providerOrderId: res.data.orderId,
      };
    } catch (err) {
      console.error("❌ MoMo create payment error:", err.response?.data || err.message);
      throw new Error("MoMo payment creation failed");
    }
  }

  async handleCallback(data) {
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const partnerCode = process.env.MOMO_PARTNER_CODE;

    const {
      amount = "",
      extraData = "",
      message = "",
      orderId = "",
      orderInfo = "",
      orderType = "",
      requestId = "",
      responseTime = "",
      resultCode = "",
      transId = "",
      payType = "",
      signature: momoSignature,
    } = data;

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${String(amount)}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${String(responseTime)}` +
      `&resultCode=${String(resultCode)}` +
      `&transId=${String(transId)}`;

    const signatureCheck = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signatureCheck !== momoSignature) {
      console.error("MoMo callback signature invalid!");
      console.log("Calculated:", signatureCheck);
      console.log("MoMo sent:", momoSignature);
      console.log("Data received:", data);
      throw new Error("Invalid MoMo callback signature");
    }

    const status = Number(resultCode) === 0 ? "SUCCESS" : "FAILED";

    return { orderId, amount, transId, message, rawData: data, status };
  }
}

module.exports = MomoProvider;
