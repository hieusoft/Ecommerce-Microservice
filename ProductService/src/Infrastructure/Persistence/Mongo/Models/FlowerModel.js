const mongoose = require('mongoose');

const FlowerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String },
    price: { type: Number, required: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Flower', FlowerSchema);