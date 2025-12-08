class OccasionUseCase {
    constructor(occasionRepository, rabbitService, redisService) {
        this.occasionRepository = occasionRepository;
        this.rabbitService = rabbitService;
        this.redisService = redisService;
    }

    async createOccasion(dto) {
        const occasion = await this.occasionRepository.createOccasion(dto);

        if (this.rabbitService) {
            await this.rabbitService.publish('product_events', 'occasion.created', {
                occasionId: occasion._id,
                name: occasion.name,
                description: occasion.description,
                timestamp: new Date()
            });
        }

        if (this.redisService) {
            await this.redisService.setObjectAsync(`occasion:${occasion._id}`, occasion, 3600);
            await this.invalidateOccasionListCache();
        }

        return occasion;
    }

   
    async getOccasionById(id) {
        if (this.redisService) {
            const cached = await this.redisService.getObjectAsync(`occasion:${id}`);
            if (cached) return cached;
        }

        const occasion = await this.occasionRepository.getOccasionById(id);

        if (occasion && this.redisService) {
            await this.redisService.setObjectAsync(`occasion:${id}`, occasion, 3600);
        }

        return occasion;
    }

   
    async getAllOccasions() {
        if (this.redisService) {
            const key = `occasions:list`;
            const cached = await this.redisService.getObjectAsync(key);
            if (cached) return cached;

            const occasions = await this.occasionRepository.getAllOccasions();
            await this.redisService.setObjectAsync(key, occasions, 1800);
            return occasions;
        }

        return await this.occasionRepository.getAllOccasions();
    }

    async updateOccasion(id, dto) {
        const updatedOccasion = await this.occasionRepository.updateOccasion(id, dto);

        if (this.redisService) {
            await this.redisService.setObjectAsync(`occasion:${id}`, updatedOccasion, 3600);
            await this.invalidateOccasionListCache();
        }

        return updatedOccasion;
    }

    async deleteOccasion(id) {
        const result = await this.occasionRepository.deleteOccasion(id);

        if (this.redisService) {
            await this.redisService.deleteAsync(`occasion:${id}`);
            await this.invalidateOccasionListCache();
        }

        return result;
    }

    async invalidateOccasionListCache() {
        if (!this.redisService) return;
        const keys = await this.redisService.searchKeysAsync("occasions:list*");
        for (const key of keys) {
            await this.redisService.deleteAsync(key);
        }
    }
}

module.exports = OccasionUseCase;
