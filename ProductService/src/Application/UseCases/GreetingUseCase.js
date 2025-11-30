class GreetingUseCase {
    constructor (greetingRepository, rabbitService) {
        this.greetingRepository = greetingRepository;
        this.rabbitService = rabbitService;
    }
    async getGreetingById(id) {
        
        return await this.greetingRepository.getGreetingById(id);
    }  
    async getAllGreetings() {
        return await this.greetingRepository.getAllGreetings();
    }
    async createGreeting(dto) {
        const greeting = await this.greetingRepository.createGreeting(dto)
        await this.rabbitService.publish('product_events', 'greeting.created', {
            greetingId: greeting._id,
            message: greeting.text,
            timestamp: new Date()
        });
        return greeting;
    }
    async updateGreeting(id, dto) {
        const greeting =  await this.greetingRepository.updateGreeting(id, dto);
        return greeting;
    }
    async deleteGreeting(id) {

        const result = await this.greetingRepository.deleteGreeting(id);
        return result;
    } 

}
module.exports = GreetingUseCase;