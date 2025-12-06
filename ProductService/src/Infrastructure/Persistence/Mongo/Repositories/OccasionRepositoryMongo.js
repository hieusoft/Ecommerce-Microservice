const OccasionModel = require("../Models/OccasionModel");
const IOccasionRepository = require("../../../../Application/Interfaces/IOccasionRepository");
const Occasion = require("../../../../Domain/Entities/Occasion");

class OccasionRepositoryMongo extends IOccasionRepository {
  async createOccasion(data) {
    const occasion = new OccasionModel(data);
    const savedOccasion = await occasion.save();
    return new Occasion(savedOccasion.toObject());
  }
  async getAllOccasions() {
    const docs = await OccasionModel.aggregate([
      {
        $lookup: {
          from: "suboccasions",
          localField: "_id",
          foreignField: "occasionId",
          as: "subOccasions",
        },
      },
    ]);

    return docs.map(
      (d) =>
        new Occasion({
          id: d._id,
          name: d.name,
          description: d.description,
          subOccasions: d.subOccasions,
        })
    );
  }

  async getOccasionById(id) {
    const docs = await OccasionModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "suboccasions",
          localField: "_id",
          foreignField: "occasionId",
          as: "subOccasions",
        },
      },
    ]);

    const doc = docs[0];

    return doc
      ? new Occasion({
          id: doc._id,
          name: doc.name,
          description: doc.description,
          subOccasions: doc.subOccasions,
        })
      : null;
  }

  async updateOccasion(id, data) {
    const updated = await OccasionModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updated ? new Occasion(updated.toObject()) : null;
  }
  async deleteOccasion(id) {
    return await OccasionModel.findByIdAndDelete(id);
  }
}

module.exports = OccasionRepositoryMongo;
