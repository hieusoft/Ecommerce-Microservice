const mongoose = require('mongoose');

const GreetingSchema = new mongoose.Schema({
  text: { type: String, required: true },
  occasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion' }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
 });

module.exports = mongoose.model('Greeting', GreetingSchema);
