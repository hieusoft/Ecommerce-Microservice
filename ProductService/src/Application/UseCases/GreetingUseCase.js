class GreetingUseCase {
    constructor (greetingRepository) {
        this.greetingRepository = greetingRepository;
    }
    async getGreetingById(id) {
        return await this.greetingRepository.getGreetingById(id);
    }  
    async getAllGreetings() {
        return await this.greetingRepository.getAllGreetings();
    }
    async createGreeting(dto) {
        return await this.greetingRepository.createGreeting(dto);
    }
    async updateGreeting(id, dto) {
        return await this.greetingRepository.updateGreeting(id, dto);
    }
    async deleteGreeting(id) {
        return await this.greetingRepository.deleteGreeting(id);
    } 

}
module.exports = GreetingUseCase;