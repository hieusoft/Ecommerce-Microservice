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
            .populate('flowers.flowerId')
            .populate('occasionId');
        return doc ? new Bouquet(doc.toObject()) : null;
    }

    async getAllBouquets(filter = {}) {
        const docs = await BouquetModel.find(filter)
            .populate('flowers.flowerId')
            .populate('occasionId');
        return docs.map(d => new Bouquet(d.toObject()));
    }

    async updateBouquet(id, data) {
        const updated = await BouquetModel.findByIdAndUpdate(id, data, { new: true })
            .populate('flowers.flowerId')
            .populate('occasionId');
        return updated ? new Bouquet(updated.toObject()) : null;
    }

    async deleteBouquet(id) {
        return await BouquetModel.findByIdAndDelete(id);
    }

    async searchBouquets(query) {
        const {
            search_query,                    
            minPrice,
            maxPrice,
            flowerMinPrice,
            flowerMaxPrice,
            minFlowerQuantity,
            maxFlowerQuantity,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc"
        } = query;

        const skip = (page - 1) * limit;

        // Filter cơ bản
        const match = {};

        // Filter theo price
        if (minPrice || maxPrice) {
            match.price = {};
            if (minPrice) match.price.$gte = Number(minPrice);
            if (maxPrice) match.price.$lte = Number(maxPrice);
        }

        // Filter theo ngày tạo
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const pipeline = [
            { $match: match },

            // Join flowers
            {
                $lookup: {
                    from: "flowers",
                    localField: "flowers.flowerId",
                    foreignField: "_id",
                    as: "flowerDetails"
                }
            },

            // Join occasions
            {
                $lookup: {
                    from: "occasions",
                    localField: "occasionId",
                    foreignField: "_id",
                    as: "occasionDetails"
                }
            },
            { $unwind: "$occasionDetails" }
        ];

        // Nếu có ô search chung q
        if (search_query) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: search_query, $options: "i" } },
                        { "flowerDetails.name": { $regex: search_query, $options: "i" } },
                        { "flowerDetails.color": { $regex: search_query, $options: "i" } },
                        { "occasionDetails.name": { $regex: search_query, $options: "i" } }
                    ]
                }
            });
        }

        // Filter giá hoa
        if (flowerMinPrice || flowerMaxPrice) {
            const priceMatch = {};
            if (flowerMinPrice) priceMatch.$gte = Number(flowerMinPrice);
            if (flowerMaxPrice) priceMatch.$lte = Number(flowerMaxPrice);

            pipeline.push({ $match: { "flowerDetails.price": priceMatch } });
        }

        // Filter số lượng hoa
        if (minFlowerQuantity || maxFlowerQuantity) {
            const quantityMatch = {};
            if (minFlowerQuantity) quantityMatch.$gte = Number(minFlowerQuantity);
            if (maxFlowerQuantity) quantityMatch.$lte = Number(maxFlowerQuantity);

            pipeline.push({ $match: { "flowers.quantity": quantityMatch } });
        }

        // Đếm tổng items
        const countPipeline = [...pipeline, { $count: "total" }];
        const count = await BouquetModel.aggregate(countPipeline);
        const totalItems = count.length > 0 ? count[0].total : 0;

        // Sort, skip, limit
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

