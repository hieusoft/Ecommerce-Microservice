const mongoose = require('mongoose');

const FlowerSchema = new mongoose.Schema({
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const BouquetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    occasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', required: true },
    flowers: { type: [FlowerSchema], default: [] },
    images: { type: [String], default: [] }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Bouquet', BouquetSchema);
