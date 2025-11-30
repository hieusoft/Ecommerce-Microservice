const ProviderFactory = require("./ProviderFactory");
const PaymentModel = require("../models/PaymentModel.js");

class PaymentService {
    async createPayment(order) {
        console.log("Creating payment for order:", order.provider);
        const provider = ProviderFactory.getProvider(order.provider);

      
       
        const paymentResult = await provider.createPayment(order);

    
        await PaymentModel.create({
            orderId: order.orderId,
            provider: provider.getProviderName(),
            amount: order.amount,
            currency: order.currency,
            status: "PENDING",
            paymentUrl: paymentResult.url
        });
        console.log("Payment record created for order:", paymentResult);
        return paymentResult;
    }

    async handleCallback(method, data) {
        const provider = ProviderFactory.getProvider(method);
        return provider.handleCallback(data);
    }
}

module.exports = new PaymentService();
