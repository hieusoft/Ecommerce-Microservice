const { getImageService } = require('../../Infrastructure/Service/ImageService');
const FlowerValidator = require('../Validators/FlowerValidator');
const path = require('path');
const fs = require('fs');

class FlowerUseCase {
    constructor(flowerRepository, rabbitService) {
        this.rabbitService = rabbitService;
        this.flowerRepository = flowerRepository;
        this.imageService = new getImageService('flowers');
    }
    async createFlower(dto) {
        FlowerValidator.validateCreate(dto);
        if (dto.images && dto.images.length > 0) {
            dto.images = await this.imageService.saveBase64Images(dto.images);
        }
        const flower = await this.flowerRepository.createFlower(dto)
        await this.rabbitService.publish('product_events', 'flower.created', {
            name: flower.name,
            price: flower.price,
            images: flower.images,
            timestamp: new Date()
        });
        return flower;
    }

    async getFlowerById(id) {
        return await this.flowerRepository.getFlowerById(id);
    }

    async getAllFlowers() {
        return await this.flowerRepository.getAllFlowers();
    }

    async updateFlower(id, dto) {
        FlowerValidator.validateUpdate(dto);
        if (dto.images && dto.images.length > 0) {
            dto.images = await this.imageService.saveBase64Images(dto.images);
        }
        const flower = await this.flowerRepository.updateFlower(id, dto);
        return flower;
    }

    async deleteFlower(id) {
        const flower = await this.flowerRepository.getBouquetById(id);

        if (flower && flower.images && flower.images.length > 0) {
            for (const imagePath of flower.images) {
                const fullPath = path.join(__dirname, '../../../', imgPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }
        const result = await this.flowerRepository.deleteFlower(id)
        return result;
    }
}
module.exports = FlowerUseCase;