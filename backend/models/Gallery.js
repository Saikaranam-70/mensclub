const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  publicId: { type: String, default: '' },
  category: { type: String, enum: ['haircut', 'beard', 'styling', 'coloring', 'salon', 'other'], default: 'other' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
