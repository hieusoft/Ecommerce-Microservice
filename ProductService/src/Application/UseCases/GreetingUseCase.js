class GreetingUseCase {
    constructor(greetingRepository, rabbitService, redisService) {
        this.greetingRepository = greetingRepository;
        this.rabbitService = rabbitService;
        this.redisService = redisService;
    }

    async getGreetingById(id) {
        if (this.redisService) {
            const cached = await this.redisService.getObjectAsync(`greeting:${id}`);
            if (cached) return cached;
        }

        const greeting = await this.greetingRepository.getGreetingById(id);

        if (greeting && this.redisService) {
            await this.redisService.setObjectAsync(`greeting:${id}`, greeting, 3600);
        }

        return greeting;
    }

    async getAllGreetings() {
        if (this.redisService) {
            const key = `greetings:list`;
            const cached = await this.redisService.getObjectAsync(key);
            if (cached) return cached;

            const greetings = await this.greetingRepository.getAllGreetings();
            await this.redisService.setObjectAsync(key, greetings, 1800);
            return greetings;
        }

        return await this.greetingRepository.getAllGreetings();
    }

    async createGreeting(dto) {
        const greeting = await this.greetingRepository.createGreeting(dto);

        if (this.rabbitService) {
            await this.rabbitService.publish('product_events', 'greeting.created', {
                greetingId: greeting._id,
                message: greeting.text,
                timestamp: new Date()
            });
        }

        if (this.redisService) {
            await this.redisService.setObjectAsync(`greeting:${greeting._id}`, greeting, 3600);
            await this.invalidateGreetingListCache();
        }

        return greeting;
    }

    async updateGreeting(id, dto) {
        const updatedGreeting = await this.greetingRepository.updateGreeting(id, dto);

        if (this.redisService) {
            await this.redisService.setObjectAsync(`greeting:${id}`, updatedGreeting, 3600);
            await this.invalidateGreetingListCache();
        }

        return updatedGreeting;
    }

    
    async deleteGreeting(id) {
        const result = await this.greetingRepository.deleteGreeting(id);

        if (this.redisService) {
            await this.redisService.deleteAsync(`greeting:${id}`);
            await this.invalidateGreetingListCache();
        }

        return result;
    }

    async invalidateGreetingListCache() {
        if (!this.redisService) return;
        const keys = await this.redisService.searchKeysAsync("greetings:list*");
        for (const key of keys) {
            await this.redisService.deleteAsync(key);
        }
    }
}

module.exports = GreetingUseCase;
