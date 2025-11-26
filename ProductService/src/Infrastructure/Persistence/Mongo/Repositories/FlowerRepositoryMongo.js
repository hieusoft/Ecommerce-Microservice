const FlowerModel = require('../Models/FlowerModel');
const IFlowerRepository = require('../../../../Application/Interfaces/IFlowerRepository');
const Flower = require('../../../../Domain/Entities/Flower');

class FlowerRepositoryMongo extends IFlowerRepository {
    async createFlower(data) {
        const flower = new FlowerModel(data);
        const savedFlower = await flower.save();
        return new Flower(savedFlower.toObject());
    }
    async getAllFlowers() {
        const docs = await FlowerModel.find();
        return docs.map(d => new Flower(d.toObject()));
    }
    async getFlowerById(id) {
        const doc = await FlowerModel.findById(id);
        return doc ? new Flower(doc.toObject()) : null;
    }
    async updateFlower(id, data) {
        const updated = await FlowerModel.findByIdAndUpdate(id, data, { new: true });
        return updated ? new Flower(updated.toObject()) : null;
    }
    async deleteFlower(id) {
        return await FlowerModel.findByIdAndDelete(id);
    }
}

module.exports = FlowerRepositoryMongo;
