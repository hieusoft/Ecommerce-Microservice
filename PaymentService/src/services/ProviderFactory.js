const MomoProvider = require("./providers/MomoProvider");
const OxaPayProvider = require("./providers/OxaPayProvider");
class ProviderFactory {
    static getProvider(name) {
        switch (name.toLowerCase()) {
            case "momo":
                return MomoProvider;
            case "oxapay":
                return OxaPayProvider;
            default:
                throw new Error("Provider not supported");
        }
    }
}

module.exports = ProviderFactory;
