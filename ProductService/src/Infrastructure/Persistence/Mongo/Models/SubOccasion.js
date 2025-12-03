const mongoose = require('mongoose');

const SubOccasionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    occasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
module.exports = mongoose.model('SubOccasion', SubOccasionSchema);