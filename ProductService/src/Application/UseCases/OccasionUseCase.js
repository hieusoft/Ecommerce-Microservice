class OccasionUseCase {
    constructor(occasionRepository, rabbitService) {
        this.occasionRepository = occasionRepository;
        this.rabbitService = rabbitService;
    }
    async createOccasion(dto) {
        const occasion = await this.occasionRepository.createOccasion(dto);
        await this.rabbitService.publish('product_events', 'occasion.created', {
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
        return occasion;
    }
    async deleteOccasion(id) {
        return await this.occasionRepository.deleteOccasion(id);
    }
}
module.exports = OccasionUseCase;