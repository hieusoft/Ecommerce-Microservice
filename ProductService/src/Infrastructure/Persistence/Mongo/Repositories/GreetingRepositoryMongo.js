const GreetingModel = require('../Models/GreetingModel');
const IGreetingRepository = require('../../../../Application/Interfaces/IGreetingRepository');
const Greeting = require('../../../../Domain/Entities/Greeting');

class GreetingRepositoryMongo extends IGreetingRepository {

    async createGreeting(data) {
        const greeting = new GreetingModel(data);
        const savedGreeting = await greeting.save();
        return new Greeting(savedGreeting.toObject());
    }
    async getAllGreetings() {
        const docs = await GreetingModel.find();
        return docs.map(d => new Greeting(d.toObject()));
    }
    async getGreetingById(id) {
        const doc = await GreetingModel.findById(id);
        return doc ? new Greeting(doc.toObject()) : null;
    }
    async updateGreeting(id, data) {
        const updated = await GreetingModel.findByIdAndUpdate
            (id, data, { new: true });
        return updated ? new Greeting(updated.toObject()) : null;
    }
    async deleteGreeting(id) {
        return await GreetingModel.findByIdAndDelete(id);
    }
}

module.exports = GreetingRepositoryMongo;
