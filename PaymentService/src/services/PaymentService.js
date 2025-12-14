const ProviderFactory = require("./ProviderFactory");
const PaymentModel = require("../models/PaymentModel.js");
const rabbit = require("../events/rabbitmq");
const axios = require("axios");
const e = require("express");
const { consoleLogger } = require("vnpay");
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();
    const response = await axios.get(
      `https://open.er-api.com/v6/latest/${fromCurrency}`
    );
    if (response.data.result !== "success") {
      throw new Error("Failed to fetch exchange rates");
    }
    const rates = response.data.rates;
    if (!rates[toCurrency]) {
      throw new Error(`Currency ${toCurrency} not found in rates`);
    }

    const rate = rates[toCurrency];
    const convertedAmount = Math.round(amount * rate);

    return convertedAmount;
  } catch (err) {
    console.error("Currency conversion failed:", err.message);
    return null;
  }
}

class PaymentService {
  async createPayment(order) {
    try {
      const provider = ProviderFactory.getProvider(order.provider);
      console.log(order.amount, order.currency);
      const fromCurrency = order.originalCurrency || "USD";
      const toCurrency = order.currency;

      const converted_amount = await convertCurrency(
        Number(order.amount),
        fromCurrency,
        toCurrency
      );

      order.converted_amount = converted_amount;
      const paymentResult = await provider.createPayment(order);
      console.log(paymentResult.url);
      await PaymentModel.create({
        orderId: order.orderId,
        userId: order.userId,
        providerOrderId: paymentResult.providerOrderId,
        provider: provider.getProviderName(),
        amount: order.amount,
        currency: order.currency,
        convertedAmount: order.converted_amount,
        status: "PENDING",
        paymentUrl: paymentResult.url,
        expiresAt: paymentResult.expiresAt,
      });

      return {
        success: true,
        message: "Payment created successfully",
        data: paymentResult,
      };
    } catch (err) {
      console.error("❌ Error creating payment:", err);

      return {
        success: false,
        message: "Payment creation failed",
        error: err.message,
      };
    }
  }
  async getAllPayments(query) {
    try {
      const payments = await PaymentModel.getAll(query);
      return payments;
    } catch (err) {
      console.error("❌ Error fetching all payments:", err);
      return [];
    }
  }
  async getStatusByProviderOrderId(providerOrderId) {
    try {
      console.log("Fetching status for providerOrderId:", providerOrderId);
      const paymentRecord = await PaymentModel.findByProviderOrderId(
        providerOrderId
      );
      return paymentRecord.status;
    } catch (err) {
      console.error("❌ Error fetching payment status:", err);
      return "ERROR";
    }
  }
  async getPaymentsByProvider(provider) {
    try {
      const payments = await PaymentModel.findByProvider(provider);
      return payments;
    } catch (err) {
      console.error("❌ Error fetching payments by provider:", err);
      return [];
    }
  }

  async findPaymentByOrderId(orderId) {
    try {
      const paymentRecord = await PaymentModel.findByOrderId(orderId);

      if (!paymentRecord) {
        return null;
      }

      return paymentRecord;
    } catch (err) {
      console.error("❌ Error fetching payment by orderId:", err);
      return null;
    }
  }

  async handleCallback(method, data) {
    try {
      const providerOrderId =
        data.providerOrderId ||
        data.vnp_TxnRef ||
        data.orderId ||
        data.invoice_id;

      const paymentRecord = await PaymentModel.findByProviderOrderId(
        providerOrderId
      );
      
      if (!paymentRecord) {
        return {
          success: false,
          status: "NOT_FOUND",
          message: "Payment not found",
        };
      }

      if (paymentRecord.status !== "PENDING") {
        return {
          success: true,
          status: paymentRecord.status,
          message: "Already processed",
        };
      }

      const provider = ProviderFactory.getProvider(method);
      const paymentResult = await provider.handleCallback(data);

      await PaymentModel.updateStatusByProviderOrderId({
        providerOrderId: providerOrderId,
        status: paymentResult.status,
        callbackData: JSON.stringify(paymentResult),
      });

      if (paymentResult.status === "SUCCESS") {
        rabbit.publish("payment_events", "payment.succeed", {
          orderId: paymentRecord.order_id,
          status: paymentResult.status,
        });
      } else {
        rabbit.publish("payment_events", "payment.failed", {
          orderId: paymentRecord.order_id,
          status: paymentResult.status,
        });
      }

           return {
        success: true,
        status: paymentResult.status,
        providerOrderId,
        orderId: paymentRecord.order_id,
        paymentMethod: paymentRecord.provider,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        message: "Callback processed successfully",
      };
    } catch (err) {
      console.error("❌ Callback error:", err);

      const providerOrderId = data.orderId || data.invoice_id || null;

      if (providerOrderId) {
        await PaymentModel.updateStatusByProviderOrderId(
          providerOrderId,
          "ERROR",
          JSON.stringify(data)
        );
      }

      return {
        success: true,
        status: paymentResult.status,
        providerOrderId,
        orderId: paymentRecord.order_id,
        paymentMethod: paymentRecord.provider,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        message: "Callback processed successfully",
      };
    }
  }
  async retryPayment(orderId, provider_name) {
    try {
      const provider = ProviderFactory.getProvider(provider_name);
      const existing = await PaymentModel.findByOrderId(orderId);
      if (!existing) {
        throw new Error(`No existing payment found for orderId ${orderId}`);
      }
      const now = new Date();
      if (
        existing &&
        existing.expires_at &&
        existing.expires_at > now &&
        existing.status !== "SUCCESS" &&
        existing.provider === provider_name
      ) {
        console.log(
          `⚠️ Existing valid payment found for order ${orderId}. Skipping retry.`
        );
        return existing;
      }
      const fromCurrency = existing.originalCurrency || "USD";
      const toCurrency = existing.currency;

      const converted_amount = await convertCurrency(
        Number(existing.amount),
        fromCurrency,
        toCurrency
      );
      const newPayment = await provider.createPayment({
        orderId: orderId,
        amount: existing?.amount,
        currency: existing?.currency,
        converted_amount: converted_amount,
        provider: provider,
      });
      await PaymentModel.create({
        orderId: orderId,
        userId: existing.user_id,
        providerOrderId: newPayment.providerOrderId,
        provider: provider.getProviderName(),
        amount: existing?.amount,
        currency: existing?.currency,
        convertedAmount: converted_amount,
        status: "PENDING",
        paymentUrl: newPayment.url,
        expiresAt: newPayment.expiresAt,
      });
      return newPayment;
    } catch (err) {
      console.error("❌ retryPayment error:", err);
      throw err;
    }
  }
}

module.exports = new PaymentService();
