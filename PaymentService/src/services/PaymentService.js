const ProviderFactory = require("./ProviderFactory");
const PaymentModel = require("../models/PaymentModel.js");
const rabbit  = require("../events/rabbitmq");
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
  async getAllPayments() {
    try {
      const payments = await PaymentModel.getAll();
      return payments;
    } catch (err) {
      console.error("❌ Error fetching all payments:", err);
      return []; 
    }
  }
  async getStatusByProviderOrderId(providerOrderId) {
    try {
      console.log("Fetching status for providerOrderId:", providerOrderId);
      const paymentRecord = await PaymentModel.findByProviderOrderId(providerOrderId);
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
    

    const paymentRecord = await PaymentModel.findByProviderOrderId(providerOrderId);


    if (!paymentRecord) {
      return { success: false, status: "NOT_FOUND", message: "Payment not found" };
    }

    if (paymentRecord.status !== "PENDING") {
      return { success: true, status: paymentRecord.status, message: "Already processed" };
    }

    const provider = ProviderFactory.getProvider(method);
    const paymentResult = await provider.handleCallback(data);
    
        await PaymentModel.updateStatusByProviderOrderId({
      providerOrderId: providerOrderId,
      status: paymentResult.status,
      callbackData: JSON.stringify(paymentResult)
    });

    if (paymentResult.status === "SUCCESS") {
       rabbit.publish("payment_events", "payment.succeed", {
      orderId: paymentRecord.order_id,
      status: paymentResult.status,
    });

    }else{
        rabbit.publish("payment_events", "payment.failed", {
      orderId: paymentRecord.orderId,
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

    const providerOrderId =
      data.orderId ||
      data.invoice_id ||
      null;

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

}

module.exports = new PaymentService();
