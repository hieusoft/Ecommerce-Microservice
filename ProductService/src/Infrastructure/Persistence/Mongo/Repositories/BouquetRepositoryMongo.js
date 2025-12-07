const BouquetModel = require('../Models/BouquetModel');
const Bouquet = require('../../../../Domain/Entities/Bouquet');
const IBouquetRepository = require('../../../../Application/Interfaces/IBouquetRepository ');

class BouquetRepositoryMongo extends IBouquetRepository {

    async createBouquet(bouquetData) {
        const bouquet = new BouquetModel(bouquetData);
        const savedBouquet = await bouquet.save();
        return new Bouquet(savedBouquet.toObject());
    }

    async getBouquetById(bouquetId) {
        const doc = await BouquetModel.findById(bouquetId)
            .populate('subOccasionId');
        if (!doc) return null;

        const bouquet = new Bouquet(doc.toObject());

        bouquet.subOccasionName = doc.subOccasionId?.name || null;

        return bouquet;
    }

    async updateBouquet(id, data) {
        const updated = await BouquetModel.findByIdAndUpdate(id, data, { new: true })
            .populate('subOccasionId');

        return updated ? new Bouquet(updated.toObject()) : null;
    }

    async deleteBouquet(id) {
        return await BouquetModel.findByIdAndDelete(id);
    }

    async getAllBouquets(query) {
        const {
            search_query,   // search tổng hợp: bouquet + sub occasion
            name,           // filter riêng tên bouquet
            subOccasionName,// filter riêng tên sub occasion
            minPrice,
            maxPrice,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc"
        } = query;

        const skip = (page - 1) * limit;

        const match = {};

        if (minPrice || maxPrice) {
            match.price = {};
            if (minPrice) match.price.$gte = Number(minPrice);
            if (maxPrice) match.price.$lte = Number(maxPrice);
        }

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const pipeline = [
            { $match: match },

            {
                $addFields: {
                    subOccasionIdObj: {
                        $cond: {
                            if: { $eq: [{ $type: "$subOccasionId" }, "string"] },
                            then: { $toObjectId: "$subOccasionId" },
                            else: "$subOccasionId"
                        }
                    }
                }
            },

            // Lookup với ObjectId chuẩn
            {
                $lookup: {
                    from: "suboccasions",
                    localField: "subOccasionIdObj",
                    foreignField: "_id",
                    as: "subOccasionsDetails"
                }
            },
            {
                $unwind: {
                    path: "$subOccasionsDetails",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];



        if (search_query) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: search_query, $options: "i" } },
                        { "subOccasionsDetails.name": { $regex: search_query, $options: "i" } }
                    ]
                }
            });
        }


        if (name) {
            pipeline.push({
                $match: {
                    name: { $regex: name, $options: "i" }
                }
            });
        }


        if (subOccasionName) {
            pipeline.push({
                $match: {
                    "subOccasionsDetails.name": { $regex: subOccasionName, $options: "i" }
                }
            });
        }

        const countPipeline = [...pipeline, { $count: "total" }];
        const count = await BouquetModel.aggregate(countPipeline);
        const totalItems = count.length > 0 ? count[0].total : 0;

        pipeline.push({ $sort: { [sortBy]: order === "desc" ? -1 : 1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: Number(limit) });

        const data = await BouquetModel.aggregate(pipeline);

        return {
            page: Number(page),
            limit: Number(limit),
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            data
        };
    }

}

module.exports = BouquetRepositoryMongo;
