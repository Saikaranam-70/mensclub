const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Generate a 6-digit numeric PIN like Rapido
const generatePIN = () => Math.floor(100000 + Math.random() * 900000).toString();

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, default: () => 'BK' + uuidv4().slice(0, 8).toUpperCase(), unique: true },

  // ── Guest booking fields (no account needed) ──
  guestName:  { type: String, default: '' },
  guestPhone: { type: String, default: '' },
  isGuest:    { type: Boolean, default: false },
  pin:        { type: String, default: generatePIN }, // 6-digit PIN for guest tracking
  pinVerified:{ type: Boolean, default: false },       // barber confirms PIN at start

  // Registered user (optional – null for guests)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  barber:  { type: mongoose.Schema.Types.ObjectId, ref: 'Barber',  required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

  date:      { type: Date,   required: true },
  startTime: { type: String, required: true }, // "14:30"
  endTime:   { type: String, required: true }, // "15:00"

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  },

  price:       { type: Number, required: true },
  notes:       { type: String, default: '' },
  cancelReason:{ type: String, default: '' },
  cancelledBy: { type: String, enum: ['user', 'admin', 'barber', ''], default: '' },

  reminderSent: { type: Boolean, default: false },

  rating:     { type: Number, min: 1, max: 5 },
  review:     { type: String, default: '' },
  reviewedAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ barber: 1, date: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ pin: 1 });           // fast PIN lookup
bookingSchema.index({ guestPhone: 1 });    // phone-based history

module.exports = mongoose.model('Booking', bookingSchema);
