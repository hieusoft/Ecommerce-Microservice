class SubOccasionUseCase {
    constructor(subOccasionRepository, rabbitService) {
        this.subOccasionRepository = subOccasionRepository;
        this.rabbitService = rabbitService;
    }
    async createSubOccasion(dto) {
        const subOccasion = await this.subOccasionRepository.createSubOccasion(dto);
        await this.rabbitService.publish('suboccasion_events', 'suboccasion.created', {
            subOccasionId: subOccasion.id,
            name: subOccasion.name,
            description: subOccasion.description,
            occasionId: subOccasion.occasionId,
        });
        return subOccasion;
    }
    async getSubOccasionById(id) {
        return await this.subOccasionRepository.getSubOccasionById(id);
    }
    async getAllSubOccasions() {
        return await this.subOccasionRepository.getAllSubOccasions();
    }
    async updateSubOccasion(id, dto) {
        const subOccasion = await this.subOccasionRepository.updateSubOccasion(id, dto);
        return subOccasion;
    }
    async deleteSubOccasion(id) {
        return await this.subOccasionRepository.deleteSubOccasion(id);
    }
}
module.exports = SubOccasionUseCase;
