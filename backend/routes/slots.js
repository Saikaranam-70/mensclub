const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../utils/slots');
const Service = require('../models/Service');
const Barber = require('../models/Barber');

// @GET /api/slots/available?barberId=&serviceId=&date=
router.get('/available', async (req, res) => {
  try {
    const { barberId, serviceId, date } = req.query;
    if (!barberId || !serviceId || !date) {
      return res.status(400).json({ success: false, message: 'barberId, serviceId and date are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const slots = await getAvailableSlots(barberId, date, service.duration, service.bufferTime || 5);
    res.json({ success: true, slots, duration: service.duration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/slots/barbers-availability?serviceId=&date=
router.get('/barbers-availability', async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) return res.status(400).json({ success: false, message: 'serviceId and date required' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const barbers = await Barber.find({ isAvailable: true }).populate('user', 'name avatar');
    const availability = await Promise.all(
      barbers.map(async (barber) => {
        const slots = await getAvailableSlots(barber._id, date, service.duration, service.bufferTime || 5);
        return { barber, availableSlots: slots.length, slots };
      })
    );

    res.json({ success: true, availability: availability.filter(a => a.availableSlots > 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
