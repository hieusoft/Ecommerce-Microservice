class OccasionUseCase {
    constructor(occasionRepository,rabbitService) {
        this.occasionRepository = occasionRepository;
        this.rabbitService = rabbitService;
    }
    async createOccasion(dto) {
        return await this.occasionRepository.createOccasion(dto);
    }
    async getOccasionById(id) {
        return await this.occasionRepository.getOccasionById(id);
    }       
    async getAllOccasions() {
        return await this.occasionRepository.getAllOccasions();
    }
    async updateOccasion(id, dto) {
        return await this.occasionRepository.updateOccasion(id, dto);
    }
    async deleteOccasion(id) {
        return await this.occasionRepository.deleteOccasion(id);
    }   
}
module.exports = OccasionUseCase;