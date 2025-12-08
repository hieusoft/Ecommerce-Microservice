class SubOccasionUseCase {
    constructor(subOccasionRepository, rabbitService, redisService) {
        this.subOccasionRepository = subOccasionRepository;
        this.rabbitService = rabbitService;
        this.redisService = redisService;
    }

    async createSubOccasion(dto) {
        const subOccasion = await this.subOccasionRepository.createSubOccasion(dto);

        if (this.rabbitService) {
            await this.rabbitService.publish('suboccasion_events', 'suboccasion.created', {
                subOccasionId: subOccasion.id,
                name: subOccasion.name,
                description: subOccasion.description,
                occasionId: subOccasion.occasionId,
                timestamp: new Date()
            });
        }

        if (this.redisService) {
            await this.redisService.setObjectAsync(`suboccasion:${subOccasion.id}`, subOccasion, 3600);
            await this.invalidateSubOccasionListCache();
        }

        return subOccasion;
    }

    async getSubOccasionById(id) {
        if (this.redisService) {
            const cached = await this.redisService.getObjectAsync(`suboccasion:${id}`);
            if (cached) return cached;
        }

        const subOccasion = await this.subOccasionRepository.getSubOccasionById(id);

        if (subOccasion && this.redisService) {
            await this.redisService.setObjectAsync(`suboccasion:${id}`, subOccasion, 3600);
        }

        return subOccasion;
    }


    async getAllSubOccasions() {
        if (this.redisService) {
            const key = `suboccasions:list`;
            const cached = await this.redisService.getObjectAsync(key);
            if (cached) return cached;

            const subOccasions = await this.subOccasionRepository.getAllSubOccasions();
            await this.redisService.setObjectAsync(key, subOccasions, 1800);
            return subOccasions;
        }

        return await this.subOccasionRepository.getAllSubOccasions();
    }

    async updateSubOccasion(id, dto) {
        const updatedSubOccasion = await this.subOccasionRepository.updateSubOccasion(id, dto);

        if (this.redisService) {
            await this.redisService.setObjectAsync(`suboccasion:${id}`, updatedSubOccasion, 3600);
            await this.invalidateSubOccasionListCache();
        }

        return updatedSubOccasion;
    }

   
    async deleteSubOccasion(id) {
        const result = await this.subOccasionRepository.deleteSubOccasion(id);

        if (this.redisService) {
            await this.redisService.deleteAsync(`suboccasion:${id}`);
            await this.invalidateSubOccasionListCache();
        }

        return result;
    }

    
    async invalidateSubOccasionListCache() {
        if (!this.redisService) return;
        const keys = await this.redisService.searchKeysAsync("suboccasions:list*");
        for (const key of keys) {
            await this.redisService.deleteAsync(key);
        }
    }
}

module.exports = SubOccasionUseCase;
