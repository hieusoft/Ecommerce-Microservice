const ISubOccasionRepository = require("../../../../Application/Interfaces/iSubOccasionRepository");
const SubOccasionModel = require("../Models/SubOccasion");
const SubOccasion = require("../../../../Domain/Entities/SubOccasion");

class SubOccasionRepository  extends ISubOccasionRepository {
    async createSubOccasion(data) {
        const subOccasion = new SubOccasionModel(data);
        const savedSubOccasion = await subOccasion.save();
        return new SubOccasion(savedSubOccasion.toObject());
    }
    async getSubOccasionById(id) {
        const doc = await SubOccasionModel.findById(id).populate('occasionId');
        return doc ? new SubOccasion(doc.toObject()) : null;
    }
    async getAllSubOccasions() {
        const docs = await SubOccasionModel.find().populate('occasionId');
        return docs.map(d => new SubOccasion(d.toObject()));
    }
    async updateSubOccasion(id, data) {
        const updated = await SubOccasionModel.findByIdAndUpdate(id, data, { new: true });      
        return updated ? new SubOccasion(updated.toObject()) : null;
    }
    async deleteSubOccasion(id) {
        return await SubOccasionModel.findByIdAndDelete(id);
    }
} 
module.exports = SubOccasionRepository;