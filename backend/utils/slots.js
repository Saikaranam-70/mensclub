const Booking = require('../models/Booking');

/**
 * Generate time slots for a barber on a given date for a given service duration
 */
const generateTimeSlots = (startTime, endTime, duration, bufferTime = 5) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  const slotDuration = duration + bufferTime;

  while (current + duration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    const endMin = current + duration;
    const eh = Math.floor(endMin / 60).toString().padStart(2, '0');
    const em = (endMin % 60).toString().padStart(2, '0');
    slots.push({ start: `${h}:${m}`, end: `${eh}:${em}` });
    current += slotDuration;
  }
  return slots;
};

/**
 * Get available slots for a barber on a date, excluding booked ones
 */
const getAvailableSlots = async (barberId, date, duration, bufferTime = 5) => {
  const Barber = require('../models/Barber');
  const barber = await Barber.findById(barberId);
  if (!barber) return [];

  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = barber.workingHours[dayName];
  if (!dayHours || dayHours.off) return [];

  const allSlots = generateTimeSlots(dayHours.start, dayHours.end, duration, bufferTime);

  // Get existing bookings for that barber on that date
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    barber: barberId,
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
  });

  const bookedTimes = existingBookings.map(b => ({ start: b.startTime, end: b.endTime }));

  const available = allSlots.filter(slot => {
    const slotStartMin = timeToMin(slot.start);
    const slotEndMin = timeToMin(slot.end);

    return !bookedTimes.some(booked => {
      const bookedStart = timeToMin(booked.start);
      const bookedEnd = timeToMin(booked.end);
      return slotStartMin < bookedEnd && slotEndMin > bookedStart;
    });
  });

  // Filter out past slots for today
  const now = new Date();
  const isToday = new Date(date).toDateString() === now.toDateString();
  if (isToday) {
    const currentMin = now.getHours() * 60 + now.getMinutes();
    return available.filter(s => timeToMin(s.start) > currentMin + 30); // 30 min buffer
  }

  return available;
};

const timeToMin = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

module.exports = { generateTimeSlots, getAvailableSlots, timeToMin };
