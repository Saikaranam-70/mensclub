const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const { protect, admin } = require('../middleware/auth');

// @GET /api/dashboard/stats - admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers, totalBarbers, totalServices,
      todayBookings, monthBookings, totalBookings,
      pendingBookings, revenue, recentBookings,
      topServices, topBarbers,
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Barber.countDocuments({ isAvailable: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ date: { $gte: monthStart }, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
      Booking.find({ date: { $gte: today, $lte: todayEnd } })
        .populate('user', 'name email').populate('service', 'name price')
        .populate({ path: 'barber', populate: { path: 'user', select: 'name' } })
        .sort({ date: 1, startTime: 1 }).limit(5),
      Service.find().sort({ totalBookings: -1 }).limit(5).select('name totalBookings price category'),
      Barber.find().sort({ completedBookings: -1 }).limit(5).populate('user', 'name').select('user completedBookings rating totalEarnings'),
    ]);

    // Weekly bookings for chart (Current calendar week: Monday to Sunday)
    const weeklyData = [];
    const currentDay = new Date();
    const dayOfWeek = currentDay.getDay(); 
    const monday = new Date(currentDay);
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(currentDay.getDate() + distanceToMonday);
    monday.setHours(0,0,0,0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const count = await Booking.countDocuments({ date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } });
      const rev = await Booking.aggregate([{ $match: { date: { $gte: start, $lte: end }, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$price' } } }]);
      weeklyData.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), bookings: count, revenue: rev[0]?.total || 0 });
    }

    res.json({
      success: true,
      stats: {
        totalUsers, totalBarbers, totalServices, todayBookings, monthBookings,
        totalBookings, pendingBookings, totalRevenue: revenue[0]?.total || 0,
      },
      recentBookings, topServices, topBarbers, weeklyData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
