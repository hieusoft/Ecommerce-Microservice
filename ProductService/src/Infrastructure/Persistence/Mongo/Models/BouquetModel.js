const mongoose = require('mongoose');

const BouquetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    occasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', required: true },
    images: { type: [String], default: [] }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Bouquet', BouquetSchema);
