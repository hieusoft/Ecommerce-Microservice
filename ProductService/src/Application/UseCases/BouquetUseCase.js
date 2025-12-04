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
                subOccasionName: fullBouquet.subOccasionName,
                timestamp: new Date()
            });
        }

        return fullBouquet;
    }


    async updateBouquet(id, dto) {
        const bouquet = await this.bouquetRepository.getBouquetById(id);
        if (!bouquet) throw new Error("Bouquet not found");
        
        BouquetValidator.validateUpdate(dto);
        let oldImages = bouquet.images || [];

        if (dto.images && dto.images.length > 0) {
            const newImages = [];
            for (let i = 0; i < dto.images.length; i++) {
                const imgItem = dto.images[i];
                if (imgItem.keep) {
                    if (bouquet.images[i]) newImages.push(bouquet.images[i]);
                } else if (imgItem.base64) {
                    const savedPath = await this.imageService.saveBase64Images([imgItem.base64]);
                    newImages.push(savedPath[0]);
                }
            }
            dto.images = newImages;
        }
        const updatedBouquet = await this.bouquetRepository.updateBouquet(id, dto);
        if (oldImages.length > 0 && updatedBouquet.images) {
            for (const imgPath of oldImages) {
                if (!updatedBouquet.images.includes(imgPath)) {
                    const fullPath = path.join(__dirname, '../../../', imgPath);
                    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                }
            }
        }

        return updatedBouquet;
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