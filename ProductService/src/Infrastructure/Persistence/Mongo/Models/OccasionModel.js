const mongoose = require('mongoose');

const OccasionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Occasion', OccasionSchema);
