const crypto = require("crypto");
const moment = require("moment");
const BasePaymentProvider = require("./BasePaymentProvider");

class VnPayProvider extends BasePaymentProvider {
  getProviderName() {
    return "vnpay";
  }

  async createPayment(order) {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let tmnCode = String(process.env.VNPAY_TMN_CODE);
    let secretKey = String(process.env.VNPAY_HASH_SECRET);
    let vnpUrl = String(process.env.VNPAY_URL);
    let returnUrl = String(process.env.VNPAY_RETURN_URL);

    let orderId = moment(date).format("DDHHmmss");
    let amount = order.amount;
    let locale = order.language || "vn";

  
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: "Thanh toan don hang " + orderId,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: "127.0.0.1",
      vnp_CreateDate: createDate,
    };

   
    const sortedKeys = Object.keys(vnp_Params).sort();
    const sortedParams = {};
    sortedKeys.forEach((key) => {
      sortedParams[key] = vnp_Params[key];
    });

    
    const signData = sortedKeys
      .map(
        (key) =>
          key +
          "=" +
          encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")
      )
      .join("&");

   
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    sortedParams["vnp_SecureHash"] = signed;

  
    const paymentUrl =
      vnpUrl +
      "?" +
      sortedKeys
        .map(
          (key) =>
            key +
            "=" +
            encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")
        )
        .join("&") +
      "&vnp_SecureHash=" +
      signed;

    return {
      url: paymentUrl,
      providerOrderId: orderId,
    };
  }

  
  async handleCallback(data) {
    const secretKey = String(process.env.VNPAY_HASH_SECRET);

   
    let params = { ...data };
    let secureHash = params["vnp_SecureHash"];

    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

   
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = {};
    sortedKeys.forEach((key) => {
      sortedParams[key] = params[key];
    });

    
    const signData = sortedKeys
      .map(
        (key) =>
          key +
          "=" +
          encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")
      )
      .join("&");

    const signedCheck = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");
   
    const isValid = secureHash === signedCheck;
    const isSuccess = params["vnp_ResponseCode"] === "00";

    return {
      isValid,
      status: isValid && isSuccess ? "SUCCESS" : "FAILED",
      vnPayStatus: params["vnp_TransactionStatus"],
      orderId: params["vnp_TxnRef"],
      vnpTransactionNo: params["vnp_TransactionNo"],
      amount: Number(params["vnp_Amount"] || 0) / 100,
      bankCode: params["vnp_BankCode"],
      payDate: params["vnp_PayDate"],
      raw: params,
    };
  }
}

module.exports = VnPayProvider;
