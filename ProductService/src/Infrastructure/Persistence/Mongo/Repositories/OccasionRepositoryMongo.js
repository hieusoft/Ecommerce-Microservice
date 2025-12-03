const OccasionModel = require('../Models/OccasionModel');
const IOccasionRepository = require('../../../../Application/Interfaces/IOccasionRepository')
const Occasion = require('../../../../Domain/Entities/Occasion');

class OccasionRepositoryMongo extends IOccasionRepository {
    async createOccasion (data) {
        const occasion = new OccasionModel(data);
        const savedOccasion = await occasion.save();
        return new Occasion(savedOccasion.toObject());
    }
    async getAllOccasions () {
        const docs = await OccasionModel.find();
        return docs.map(d => new Occasion(d.toObject()));
    }
    async getOccasionById (id) {
        const doc = await OccasionModel.findById(id);
        return doc ? new Occasion(doc.toObject()) : null;
    }
    async updateOccasion (id, data) {
        const updated = await OccasionModel.findByIdAndUpdate   (id, data, { new: true });      
        return updated ? new Occasion(updated.toObject()) : null;
    }
    async deleteOccasion (id) {
        return await OccasionModel.findByIdAndDelete(id);
    }

}

module.exports = OccasionRepositoryMongo;
