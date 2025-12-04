const ISubOccasionRepository = require("../../../../Application/Interfaces/ISubOccasionRepository");
const SubOccasionModel = require("../Models/SubOccasion");
const SubOccasion = require("../../../../Domain/Entities/SubOccasion");
const OccasionModel = require("../Models/OccasionModel");
class SubOccasionRepository extends ISubOccasionRepository {
    async createSubOccasion(data) {
        if (data.occasionId) {
            try {
                const occasion = await OccasionModel.findById(data.occasionId);
                if (!occasion) {
                    const error = new Error("Occasion not found");
                    error.statusCode = 404;
                    throw error;
                }
            } catch (err) {
                const error = new Error("Occasion not found");
                error.statusCode = 404;
                throw error;
            }
        }


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
        if (data.occasionId) {
            try {
                const occasion = await OccasionModel.findById(data.occasionId);
                if (!occasion) {
                    const error = new Error("Occasion not found");
                    error.statusCode = 404;
                    throw error;
                }
            } catch (err) {
                const error = new Error("Occasion not found");
                error.statusCode = 404;
                throw error;
            }
        }

        const updated = await SubOccasionModel.findByIdAndUpdate(id, data, { new: true });
        return updated ? new SubOccasion(updated.toObject()) : null;
    }
    async deleteSubOccasion(id) {
        return await SubOccasionModel.findByIdAndDelete(id);
    }
}
module.exports = SubOccasionRepository;