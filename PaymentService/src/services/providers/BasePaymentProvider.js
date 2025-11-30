class BasePaymentProvider {
    async createPayment(order) {
        throw new Error("createPayment() must be implemented");
    }

    async handleCallback(data) {
        throw new Error("handleCallback() must be implemented");
    }

    getProviderName() {
        throw new Error("getProviderName() must be implemented");
    }
}
module.exports = BasePaymentProvider;

