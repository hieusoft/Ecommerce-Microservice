
const OxaPayProvider = require("./providers/OxaPayProvider");
const MomoProvider = require("./providers/MomoProvider");
const VnPayProvider = require("./providers/VnPayProvider");
class ProviderFactory {
    static getProvider(name) {
        switch (name.toLowerCase()) {
            case "momo":
                return new MomoProvider;
            case "vnpay":

                return new VnPayProvider;
            case "oxapay":
                
                return new OxaPayProvider;    
            default:
                throw new Error("Provider not supported");
        }
    }
}

module.exports = ProviderFactory;
