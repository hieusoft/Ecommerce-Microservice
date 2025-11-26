const ImageValidator = require('./ImageValidator');

class BouquetValidator {
    static validateCreate(dto) {
        if (!dto.name || !dto.description || !dto.price || !dto.occasionId) {
            throw new Error("Missing required fields: name, description, price, occasionId");
        }

        if (dto.images && dto.images.length > 0) {
            ImageValidator.validateImages(dto.images, 5, 10);
        }
    }

    static validateUpdate(dto) {
        if (dto.images && dto.images.length > 0) {
            ImageValidator.validateImages(dto.images, 5, 10);
        }
    }
}

module.exports = BouquetValidator;
