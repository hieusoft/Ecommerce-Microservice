const ImageValidator = require("./ImageValidator");

class FlowerValidator {
    static validateCreate(dto) {
        if (!dto.name || !dto.price) {
            throw new Error("Missing required fields: name, price");
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

module.exports = FlowerValidator;