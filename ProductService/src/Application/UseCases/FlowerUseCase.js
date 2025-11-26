class FlowerUseCase {
    constructor(flowerRepository) {
        this.flowerRepository = flowerRepository;
    }
    async createFlower(dto) {
        return await this.flowerRepository.createFlower(dto);
    }

    async getFlowerById(id) {
        return await this.flowerRepository.getFlowerById(id);
    }
    async getAllFlowers() {
        return await this.flowerRepository.getAllFlowers();
    }
    async updateFlower(id, dto) {
        return await this.flowerRepository.updateFlower(id, dto);
    }   
    async deleteFlower(id) {
        return await this.flowerRepository.deleteFlower(id);
    }   
}
module.exports = FlowerUseCase;