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
            search_query,
            name,
            subOccasionId,
            subOccasionName,
            minPrice,
            maxPrice,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortOption,
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

        if (subOccasionId) {
            pipeline.push({
                $match: {
                    $expr: { $eq: [{ $toString: "$subOccasionId" }, subOccasionId] }
                }
            });
        }
        if (subOccasionName) {
            let raw = String(subOccasionName);
            try {
                raw = decodeURIComponent(raw);
            } catch (e) {

            }
            let normalized = raw
                .replace(/[-_+]/g, " ")
                .replace(/\s*&\s*/g, " & ")
                .replace(/\s+/g, " ")
                .trim();
            ;
            pipeline.push({
                $match: {
                    "subOccasionsDetails.name": {
                        $regex: new RegExp(`^${normalized}$`, "i")
                    }
                }
            });
        }



        const countPipeline = [...pipeline, { $count: "total" }];
        const count = await BouquetModel.aggregate(countPipeline);
        const totalItems = count.length > 0 ? count[0].total : 0;
        if (sortOption) {
            if (sortOption === "priceAsc")
                pipeline.push({ $sort: { price: 1 } });
            else if (sortOption === "priceDesc")
                pipeline.push({ $sort: { price: -1 } });
            else if (sortOption === "nameAsc")
                pipeline.push({ $sort: { name: 1 } });
            else if (sortOption === "nameDesc")
                pipeline.push({ $sort: { name: -1 } });
            else if (sortOption === "oldest")
                pipeline.push({ $sort: { createdAt: 1 } });
            else if (sortOption === "newest")
                pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: Number(limit) });

        pipeline.push({
            $addFields: {
                subOccasionId: {
                    $mergeObjects: [
                        "$subOccasionsDetails",
                        { id: "$subOccasionsDetails._id" }
                    ]
                },
                subOccasionName: "$subOccasionsDetails.name"
            }
        });



        const rawData = await BouquetModel.aggregate(pipeline);

        const data = rawData.map(item => new Bouquet({
            id: item._id.toString(),
            name: item.name,
            description: item.description,
            price: item.price,
            subOccasionId: item.subOccasionId,
            images: item.images || [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));

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
