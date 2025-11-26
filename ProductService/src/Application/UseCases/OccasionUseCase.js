class OccasionUseCase {
    constructor(occasionRepository, rabbitService) {
        this.occasionRepository = occasionRepository;
        this.rabbitService = rabbitService;
    }
    async createOccasion(dto) {
        const occasion = await this.occasionRepository.createOccasion(dto);
        await this.rabbitService.publish('occasionExchange', 'createOccasion', {
            action: 'OCCASION_CREATED',
            occasionId: occasion._id,
            name: occasion.name,
            description: occasion.description,
            timestamp: new Date()
        });
        return occasion;;
    }
    async getOccasionById(id) {
        return await this.occasionRepository.getOccasionById(id);
    }
    async getAllOccasions() {
        return await this.occasionRepository.getAllOccasions();
    }
    async updateOccasion(id, dto) {
        const occasion = await this.occasionRepository.createOccasion(dto);
        await this.rabbitService.publish('occasionExchange', 'updateOccasion', {
            action: 'OCCASION_UPDATED',
            occasionId: id,
            updates: dto,
            timestamp: new Date()
        });
        return occasion;
    }
    async deleteOccasion(id) {
        await this.rabbitService.publish('occasionExchange', 'deleteOccasion', {
            action: 'OCCASION_DELETED',
            occasionId: id,
            timestamp: new Date()
        });
        return await this.occasionRepository.deleteOccasion(id);
    }
}
module.exports = OccasionUseCase;