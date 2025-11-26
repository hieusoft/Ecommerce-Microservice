class OccasionUseCase {
    constructor(occasionRepository) {
        this.occasionRepository = occasionRepository;
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