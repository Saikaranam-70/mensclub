const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specializations: [{ type: String }],
  experience: { type: Number, default: 0 }, // years
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  workingHours: {
    monday:    { start: { type: String, default: '09:00' }, end: { type: String, default: '20:00' }, off: { type: Boolean, default: false } },
    tuesday:   { start: { type: String, default: '09:00' }, end: { type: String, default: '20:00' }, off: { type: Boolean, default: false } },
    wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '20:00' }, off: { type: Boolean, default: false } },
    thursday:  { start: { type: String, default: '09:00' }, end: { type: String, default: '20:00' }, off: { type: Boolean, default: false } },
    friday:    { start: { type: String, default: '09:00' }, end: { type: String, default: '20:00' }, off: { type: Boolean, default: false } },
    saturday:  { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, off: { type: Boolean, default: false } },
    sunday:    { start: { type: String, default: '09:00' }, end: { type: String, default: '14:00' }, off: { type: Boolean, default: true } },
  },
  totalEarnings: { type: Number, default: 0 },
  completedBookings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Barber', barberSchema);
