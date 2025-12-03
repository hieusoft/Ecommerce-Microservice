const { getImageService } = require('../../Infrastructure/Service/ImageService');
const BouquetValidator = require('../Validators/BouquetValidator');
const path = require('path');
const fs = require('fs');

class BouquetUseCase {
    constructor(bouquetRepository, rabbitService) {
        this.bouquetRepository = bouquetRepository;
        this.rabbitService = rabbitService;
        this.imageService = new getImageService('bouquets');
    }

    async createBouquet(dto) {
        BouquetValidator.validateCreate(dto);

        if (dto.images && dto.images.length > 0) {
            dto.images = await this.imageService.saveBase64Images(dto.images);
        }

        const bouquet = await this.bouquetRepository.createBouquet(dto);

        const fullBouquet = await this.bouquetRepository.getBouquetById(bouquet.id);

        if (this.rabbitService) {
            await this.rabbitService.publish('product_events', 'bouquet.created', {
                bouquetId: fullBouquet.id,
                name: fullBouquet.name,
                price: fullBouquet.price,
                images: fullBouquet.images,
                occasionName: fullBouquet.occasionName,
                timestamp: new Date()
            });
        }

        return fullBouquet;
    }


    async updateBouquet(id, dto) {
        BouquetValidator.validateCreate(dto);

        if (dto.images && dto.images.length > 0) {
            dto.images = await this.imageService.saveBase64Images(dto.images);
        }

        const bouquet = await this.bouquetRepository.updateBouquet(id, dto);


        return bouquet;
    }

    async getBouquetById(id) {
        return await this.bouquetRepository.getBouquetById(id);
    }

    // async getAllBouquets() {
    //     return await this.bouquetRepository.getAllBouquets();
    // }

    async deleteBouquet(id) {
        const bouquet = await this.bouquetRepository.getBouquetById(id);

        if (bouquet && bouquet.images) {
            for (const imgPath of bouquet.images) {
                const fullPath = path.join(__dirname, '../../../', imgPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        const result = await this.bouquetRepository.deleteBouquet(id);

        return result;
    }

    async getAllBouquets(query) {
        return await this.bouquetRepository.getAllBouquets(query);
    }
}

module.exports = BouquetUseCase;