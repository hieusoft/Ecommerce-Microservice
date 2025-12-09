const ProviderFactory = require("./ProviderFactory");
const PaymentModel = require("../models/PaymentModel.js");
const rabbit = require("../events/rabbitmq");
const e = require("express");
class PaymentService {
  async createPayment(order) {
    try {
      const provider = ProviderFactory.getProvider(order.provider);

      const paymentResult = await provider.createPayment(order);

      await PaymentModel.create({
        orderId: order.orderId,
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

      return { success: false, status: "ERROR", message: err.message };
    }
  }
  async retryPayment(orderId,provider_name){
      try {
        const provider = ProviderFactory.getProvider(provider_name);
        const existing = await PaymentModel.findByOrderId(orderId);
        const now = new Date();
        if (existing && existing.expires_at && existing.expires_at > now && existing.status !== "SUCCESS") {
            return  existing
        }
        const newPayment = await provider.createPayment({
            orderId: orderId,
            amount: existing?.amount,             
            currency: existing?.currency,          
            provider: provider
        });
        await PaymentModel.create({
        orderId: orderId,
        providerOrderId: newPayment.providerOrderId,
        provider: provider.getProviderName(),
        amount: existing?.amount,
        currency:existing?.currency,
        convertedAmount: existing?.amount,
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
