const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Barber  = require('../models/Barber');
const { protect, admin, barberOrAdmin } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { sendEmail, bookingConfirmationEmail } = require('../utils/email');
const { timeToMin } = require('../utils/slots');

/* ─────────────────────────────────────────────
   HELPER: check slot conflict for a barber/date
───────────────────────────────────────────── */
async function hasConflict(barberId, date, startMin, durationMin) {
  const dateStart = new Date(date); dateStart.setHours(0,0,0,0);
  const dateEnd   = new Date(date); dateEnd.setHours(23,59,59,999);
  const existing  = await Booking.find({
    barber: barberId,
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $in: ['pending','confirmed','in_progress'] },
  });
  return existing.some(b => {
    const bStart = timeToMin(b.startTime);
    const bEnd   = timeToMin(b.endTime);
    return startMin < bEnd && (startMin + durationMin) > bStart;
  });
}

/* ─────────────────────────────────────────────
   POST /api/bookings/guest  – no login required
   Body: { guestName, guestPhone, barberId, serviceId, date, startTime, notes }
   Returns: { booking, pin }
───────────────────────────────────────────── */
router.post('/guest', async (req, res) => {
  try {
    const { guestName, guestPhone, barberId, serviceId, date, startTime, notes } = req.body;
    if (!guestName || !guestPhone || !barberId || !serviceId || !date || !startTime)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive)
      return res.status(404).json({ success: false, message: 'Service not found' });

    const barber = await Barber.findById(barberId).populate('user','name email');
    if (!barber || !barber.isAvailable)
      return res.status(404).json({ success: false, message: 'Barber not available' });

    const startMin = timeToMin(startTime);
    if (await hasConflict(barberId, date, startMin, service.duration))
      return res.status(409).json({ success: false, message: 'Slot already booked. Please choose another.' });

    const endMin = startMin + service.duration;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`;

    const booking = await Booking.create({
      guestName, guestPhone, isGuest: true,
      barber: barberId, service: serviceId,
      date: new Date(date), startTime, endTime,
      price: service.price, notes: notes || '',
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

    await booking.populate([
      { path: 'barber', populate: { path: 'user', select: 'name' } },
      { path: 'service', select: 'name duration price category' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! Save your PIN.',
      booking: {
        _id:        booking._id,
        bookingId:  booking.bookingId,
        pin:        booking.pin,
        guestName:  booking.guestName,
        guestPhone: booking.guestPhone,
        date:       booking.date,
        startTime:  booking.startTime,
        endTime:    booking.endTime,
        status:     booking.status,
        price:      booking.price,
        service:    booking.service,
        barber:     booking.barber,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   POST /api/bookings/guest/lookup
   Body: { phone }  OR  { pin }
   Returns recent/active bookings for that guest
───────────────────────────────────────────── */
router.post('/guest/lookup', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone && !pin)
      return res.status(400).json({ success: false, message: 'Provide phone or PIN' });

    const filter = { isGuest: true };
    if (pin)   filter.pin   = pin;
    if (phone) filter.guestPhone = phone;

    const bookings = await Booking.find(filter)
      .populate({ path: 'barber', populate: { path: 'user', select: 'name' } })
      .populate('service', 'name duration price category')
      .sort({ createdAt: -1 })
      .limit(10);

    if (!bookings.length)
      return res.status(404).json({ success: false, message: 'No bookings found' });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   POST /api/bookings/verify-pin
   Barber verifies customer PIN at start of session
   Body: { bookingId, pin }
───────────────────────────────────────────── */
router.post('/verify-pin', protect, barberOrAdmin, async (req, res) => {
  try {
    const { bookingId, pin } = req.body;
    const booking = await Booking.findById(bookingId)
      .populate('service','name').populate('user','name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.pin !== pin)
      return res.status(400).json({ success: false, message: 'Incorrect PIN' });

    booking.pinVerified = true;
    booking.status = 'in_progress';
    await booking.save();

    // Notify if registered user
    if (booking.user) {
      await createNotification({
        userId: booking.user._id,
        title: 'Session Started ✂️',
        message: `Your ${booking.service?.name} session has started!`,
        type: 'booking_confirmed',
        relatedBooking: booking._id,
      });
    }

    res.json({ success: true, message: 'PIN verified! Session started.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   POST /api/bookings   – logged-in user booking
───────────────────────────────────────────── */
router.post('/', protect, async (req, res) => {
  try {
    const { barberId, serviceId, date, startTime, notes } = req.body;
    if (!barberId || !serviceId || !date || !startTime)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive)
      return res.status(404).json({ success: false, message: 'Service not found' });

    const barber = await Barber.findById(barberId).populate('user','name email');
    if (!barber || !barber.isAvailable)
      return res.status(404).json({ success: false, message: 'Barber not available' });

    const startMin = timeToMin(startTime);
    if (await hasConflict(barberId, date, startMin, service.duration))
      return res.status(409).json({ success: false, message: 'Slot already booked. Please select another.' });

    const endMin  = startMin + service.duration;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`;

    const booking = await Booking.create({
      user: req.user._id, isGuest: false,
      barber: barberId, service: serviceId,
      date: new Date(date), startTime, endTime,
      price: service.price, notes: notes || '',
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

    await createNotification({
      userId: req.user._id,
      title: 'Booking Confirmed! ✅',
      message: `Your ${service.name} on ${new Date(date).toDateString()} at ${startTime} is confirmed. PIN: ${booking.pin}`,
      type: 'booking_confirmed',
      relatedBooking: booking._id,
    });

    try { await sendEmail(bookingConfirmationEmail(booking, req.user, barber, service)); } catch {}

    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'barber', populate: { path: 'user', select: 'name' } },
      { path: 'service', select: 'name duration price category' },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/bookings/my  – logged-in user history
───────────────────────────────────────────── */
router.get('/my', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate({ path:'barber', populate:{ path:'user', select:'name avatar' } })
      .populate('service','name duration price image category')
      .sort({ date:-1, startTime:-1 })
      .skip((page-1)*limit).limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success:true, bookings, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

/* GET /api/bookings/admin/all */
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { status, date, barberId, page=1, limit=20, isGuest, search } = req.query;
    const filter = {};
    if (status)   filter.status  = status;
    if (barberId) filter.barber  = barberId;
    if (isGuest !== undefined) filter.isGuest = isGuest === 'true';
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(new Date(d).setHours(0,0,0,0)), $lte: new Date(new Date(d).setHours(23,59,59,999)) };
    }

    if (search) {
      const User = require('../models/User');
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = matchedUsers.map(u => u._id);

      filter.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } },
        { pin: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('user','name email phone')
      .populate('service','name duration price category')
      .populate({ path:'barber', populate:{ path:'user', select:'name' } })
      .sort({ date:-1, startTime:-1 })
      .skip((page-1)*limit).limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success:true, bookings, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

/* GET /api/bookings/admin/pin/:pin */
router.get('/admin/pin/:pin', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.findOne({ pin: req.params.pin })
      .populate('user','name email phone')
      .populate('service','name duration price category')
      .populate({ path:'barber', populate:{ path:'user', select:'name' } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking with this PIN not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/bookings/barber/schedule */
router.get('/barber/schedule', protect, barberOrAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const barber = await Barber.findOne({ user: req.user._id });
    if (!barber) return res.status(404).json({ success:false, message:'Barber profile not found' });
    const d = new Date(date || new Date());
    const filter = {
      barber: barber._id,
      date: { $gte: new Date(new Date(d).setHours(0,0,0,0)), $lte: new Date(new Date(d).setHours(23,59,59,999)) },
    };
    const bookings = await Booking.find(filter)
      .populate('user','name phone avatar')
      .populate('service','name duration price category')
      .sort({ startTime:1 });
    res.json({ success:true, bookings });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

/* PUT /api/bookings/:id/status */
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('user','name email').populate('service','name')
      .populate({ path:'barber', populate:{ path:'user', select:'name' } });
    if (!booking) return res.status(404).json({ success:false, message:'Booking not found' });

    const isAdmin  = req.user.role === 'admin';
    const isOwner  = booking.user && booking.user._id.toString() === req.user._id.toString();
    const barberDoc= await Barber.findOne({ user: req.user._id });
    const isBarber = barberDoc && booking.barber._id.toString() === barberDoc._id.toString();
    if (!isAdmin && !isOwner && !isBarber)
      return res.status(403).json({ success:false, message:'Not authorized' });

    booking.status = status;
    if (cancelReason) booking.cancelReason = cancelReason;
    if (status === 'cancelled') booking.cancelledBy = isAdmin?'admin':isBarber?'barber':'user';
    if (status === 'completed')
      await Barber.findByIdAndUpdate(booking.barber._id, { $inc:{ completedBookings:1, totalEarnings: booking.price } });
    await booking.save();

    const msgs = {
      confirmed:   `Your ${booking.service?.name} booking is confirmed.`,
      cancelled:   `Your booking has been cancelled.`,
      completed:   `Your ${booking.service?.name} session is complete. Thank you! 🙏`,
      in_progress: `Your ${booking.service?.name} session has started ✂️`,
    };
    if (msgs[status] && booking.user && !isOwner) {
      await createNotification({ userId:booking.user._id, title:`Booking ${status}`, message:msgs[status], type:'booking_confirmed', relatedBooking:booking._id });
    }
    res.json({ success:true, booking });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

/* POST /api/bookings/:id/review */
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findOne({ _id:req.params.id, user:req.user._id });
    if (!booking) return res.status(404).json({ success:false, message:'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success:false, message:'Can only review completed bookings' });
    if (booking.rating) return res.status(400).json({ success:false, message:'Already reviewed' });
    booking.rating = rating; booking.review = review; booking.reviewedAt = new Date();
    await booking.save();
    const rated = await Booking.find({ barber:booking.barber, rating:{ $exists:true,$ne:null } });
    const avg = rated.reduce((s,b)=>s+b.rating,0)/rated.length;
    await Barber.findByIdAndUpdate(booking.barber, { rating:avg, totalReviews:rated.length });
    res.json({ success:true, message:'Review submitted' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

/* GET /api/bookings/:id */
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user','name email phone')
      .populate('service','name duration price category image')
      .populate({ path:'barber', populate:{ path:'user', select:'name avatar' } });
    if (!booking) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, booking });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;
