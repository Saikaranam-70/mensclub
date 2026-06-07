const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// @GET /api/reviews - public reviews
router.get('/', async (req, res) => {
  try {
    const { barberId, limit = 20 } = req.query;
    const filter = { rating: { $exists: true, $ne: null }, status: 'completed' };
    if (barberId) filter.barber = barberId;
    const reviews = await Booking.find(filter)
      .populate('user', 'name avatar')
      .populate('service', 'name')
      .populate({ path: 'barber', populate: { path: 'user', select: 'name' } })
      .select('rating review reviewedAt user service barber')
      .sort({ reviewedAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
