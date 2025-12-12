const ImageValidator = require('./ImageValidator');

class BouquetValidator {
    static validateCreate(dto) {
        if (!dto.name || !dto.description || !dto.price || !dto.subOccasionId) {
            throw new Error("Missing required fields: name, description, price, subOccasionId");
        }

        if (dto.images && dto.images.length > 0) {
            ImageValidator.validateImages(dto.images, 5, 10);
        }

        if (dto.quantity < 0) {
            throw new Error("Quantity cannot be negative");
        }

    }

    static validateUpdate(dto) {
        if (dto.images && dto.images.length > 0) {
            ImageValidator.validateImages(dto.images, 5, 10);
        }
        if (dto.quantity < 0) {
            throw new Error("Quantity cannot be negative");
        }
    }
}

module.exports = BouquetValidator;
