const mongoose = require('mongoose');

const salonSettingsSchema = new mongoose.Schema({
  salonName: { type: String, default: 'SalonPro' },
  tagline: { type: String, default: 'Premium Grooming Experience' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  address: { type: String, default: '' },
  mapUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.1352467362095!2d78.43577317597193!3d17.405335102555306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb97241285317f%3A0xc3f8e6587de5b1bc!2sBanjara%20Hills%2C%20Hyderabad%2C%20Telangana%20500034!5e0!3m2!1sen!2sin!4v1703664720102!5m2!1sen!2sin' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  about: { type: String, default: '' },
  openingHours: {
    monday:    { open: String, close: String, closed: Boolean },
    tuesday:   { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday:  { open: String, close: String, closed: Boolean },
    friday:    { open: String, close: String, closed: Boolean },
    saturday:  { open: String, close: String, closed: Boolean },
    sunday:    { open: String, close: String, closed: Boolean },
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
  bookingSettings: {
    advanceBookingDays: { type: Number, default: 30 },
    minAdvanceHours: { type: Number, default: 1 },
    maxBookingsPerSlot: { type: Number, default: 1 },
    autoConfirm: { type: Boolean, default: true },
    allowCancellation: { type: Boolean, default: true },
    cancellationHours: { type: Number, default: 2 },
  },
  heroImages: [{ type: String }],
  announcements: [{ text: String, isActive: Boolean, createdAt: Date }],
}, { timestamps: true });

module.exports = mongoose.model('SalonSettings', salonSettingsSchema);
