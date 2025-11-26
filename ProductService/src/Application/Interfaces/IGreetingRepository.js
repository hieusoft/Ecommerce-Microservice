class IGreetingRepository {
    async getGreetingById(id) {
        throw new Error("Method not implemented");
    }
    async getAllGreetings() {
        throw new Error("Method not implemented");
    }
    async createGreeting(greetingData) {
        throw new Error("Method not implemented");
    }
    async updateGreeting(id, greetingData) {
        throw new Error("Method not implemented");
    }
    async deleteGreeting(id) {
        throw new Error("Method not implemented");
    }
}
module.exports = IGreetingRepository;