const { getImageService } = require('../../Infrastructure/Service/ImageService');
const BouquetValidator = require('../Validators/BouquetValidator');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class BouquetUseCase {
    constructor(bouquetRepository, rabbitService, redisService ) {
        this.bouquetRepository = bouquetRepository;
        this.rabbitService = rabbitService;
        this.redisService = redisService;
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

        
        if (this.redisService) {
            await this.redisService.setObjectAsync(`bouquet:${fullBouquet.id}`, fullBouquet, 3600); 
           
            await this.invalidateBouquetListCache();
        }

        return fullBouquet;
    }

    async updateBouquet(id, dto) {
        const bouquet = await this.bouquetRepository.getBouquetById(id);
        if (!bouquet) throw new Error("Bouquet not found");

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
                } else if (imgItem.url) {
                    newImages.push(imgItem.url);
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

      
        if (this.redisService) {
            await this.redisService.setObjectAsync(`bouquet:${id}`, updatedBouquet, 3600);
            await this.invalidateBouquetListCache();
        }

        return updatedBouquet;
    }

    async getBouquetById(id) {
        if (this.redisService) {
            const cached = await this.redisService.getObjectAsync(`bouquet:${id}`);
            if (cached) return cached;
        }

        const bouquet = await this.bouquetRepository.getBouquetById(id);

        if (bouquet && this.redisService) {
            await this.redisService.setObjectAsync(`bouquet:${id}`, bouquet, 3600);
        }

        return bouquet;
    }

    async deleteBouquet(id) {
        const bouquet = await this.bouquetRepository.getBouquetById(id);

        if (bouquet && bouquet.images) {
            for (const imgPath of bouquet.images) {
                const fullPath = path.join(__dirname, '../../../', imgPath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }
        }

        const result = await this.bouquetRepository.deleteBouquet(id);

       
        if (this.redisService) {
            await this.redisService.deleteAsync(`bouquet:${id}`);
            await this.invalidateBouquetListCache();
        }

        return result;
    }

    async getAllBouquets(query) {
        console.log("Fetching bouquets with query:", query);

        if (this.redisService) {
            
            const key = `bouquets:list:${crypto.createHash('md5').update(JSON.stringify(query)).digest('hex')}`;

            const cached = await this.redisService.getObjectAsync(key);
            if (cached) {
                return cached;
            }

            const bouquets = await this.bouquetRepository.getAllBouquets(query);

            
            await this.redisService.setObjectAsync(key, bouquets, 1800);

            return bouquets;
        }

        return await this.bouquetRepository.getAllBouquets(query);
    }


  
    async invalidateBouquetListCache() {
        if (!this.redisService) return;
        const keys = await this.redisService.searchKeysAsync("bouquets:list:*");
        for (const key of keys) {
            await this.redisService.deleteAsync(key);
        }
    }
}

module.exports = BouquetUseCase;
