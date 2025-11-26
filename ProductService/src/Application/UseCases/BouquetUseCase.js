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
        
        // Sử dụng this.rabbitService thay vì global.rabbitService
        if (this.rabbitService) {
            await this.rabbitService.publish('bouquetExchange', 'createBouquet', {
                action: 'BOUQUET_CREATED',
                bouquetId: bouquet._id,
                name: bouquet.name,
                price: bouquet.price,
                images: bouquet.images,
                timestamp: new Date()
            });
        }
        
        return bouquet;
    }

    async updateBouquet(id, dto) {
        BouquetValidator.validateCreate(dto);
        
        if (dto.images && dto.images.length > 0) {
            dto.images = await this.imageService.saveBase64Images(dto.images);
        }
        
        const bouquet = await this.bouquetRepository.updateBouquet(id, dto);
        
        // Sử dụng this.rabbitService
        if (this.rabbitService) {
            await this.rabbitService.publish('bouquetExchange', 'updateBouquet', {
                action: 'BOUQUET_UPDATED',
                bouquetId: id,
                updates: dto,
                timestamp: new Date()
            });
        }
        
        return bouquet;
    }

    async getBouquetById(id) {
        return await this.bouquetRepository.getBouquetById(id);
    }

    async getAllBouquets() {
        return await this.bouquetRepository.getAllBouquets();
    }

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
        
        // Sử dụng this.rabbitService
        if (this.rabbitService && result) {
            await this.rabbitService.publish('bouquetExchange', 'deleteBouquet', {
                action: 'BOUQUET_DELETED',
                bouquetId: id,
                timestamp: new Date()
            });
        }
        
        return result;
    }

    async searchBouquets(query) {
        return await this.bouquetRepository.searchBouquets(query);
    }
}

module.exports = BouquetUseCase;