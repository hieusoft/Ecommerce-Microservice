const mongoose = require('mongoose');

const GreetingSchema = new mongoose.Schema({
  text: { type: String, required: true },
  subOccasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOccasion', required: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Greeting', GreetingSchema);
