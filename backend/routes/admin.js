const express = require('express');
const router = express.Router();
const SalonSettings = require('../models/SalonSettings');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

// @GET /api/admin/settings - public (for frontend display)
router.get('/settings', async (req, res) => {
  try {
    let settings = await SalonSettings.findOne();
    if (!settings) {
      settings = await SalonSettings.create({
        salonName: 'SalonPro',
        tagline: 'Premium Grooming Experience',
        openingHours: {
          monday: { open: '09:00', close: '20:00', closed: false },
          tuesday: { open: '09:00', close: '20:00', closed: false },
          wednesday: { open: '09:00', close: '20:00', closed: false },
          thursday: { open: '09:00', close: '20:00', closed: false },
          friday: { open: '09:00', close: '20:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '14:00', closed: true },
        },
      });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/settings - admin
router.put('/settings', protect, admin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'heroImages', maxCount: 5 },
]), async (req, res) => {
  try {
    let settings = await SalonSettings.findOne() || new SalonSettings();
    const updates = { ...req.body };

    // Parse nested JSON fields from form data
    ['openingHours', 'socialMedia', 'bookingSettings'].forEach(field => {
      if (updates[field] && typeof updates[field] === 'string') {
        try { updates[field] = JSON.parse(updates[field]); } catch {}
      }
    });

    if (req.files?.logo?.[0]) {
      const result = await uploadToCloudinary(req.files.logo[0].buffer, 'salon/branding');
      updates.logo = result.secure_url;
    }
    if (req.files?.coverImage?.[0]) {
      const result = await uploadToCloudinary(req.files.coverImage[0].buffer, 'salon/branding');
      updates.coverImage = result.secure_url;
    }
    if (req.files?.heroImages) {
      const heroUrls = [];
      for (const file of req.files.heroImages) {
        const result = await uploadToCloudinary(file.buffer, 'salon/hero');
        heroUrls.push(result.secure_url);
      }
      updates.heroImages = [...(settings.heroImages || []), ...heroUrls];
    }

    Object.assign(settings, updates);
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/admin/create-admin
router.post('/create-admin', protect, admin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
