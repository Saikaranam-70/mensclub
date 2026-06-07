const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['haircut', 'beard', 'hair_treatment', 'styling', 'coloring', 'combo', 'other'], default: 'haircut' },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 5 }, // minutes
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  bufferTime: { type: Number, default: 5 }, // minutes gap between slots
  totalBookings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
