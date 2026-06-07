const express = require('express');
const router = express.Router();
const Barber = require('../models/Barber');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

// @GET /api/barbers - public
router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find({ isAvailable: true }).populate('user', 'name email phone avatar');
    res.json({ success: true, barbers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/barbers/all - admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const barbers = await Barber.find().populate('user', 'name email phone avatar isActive');
    res.json({ success: true, barbers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/barbers/:id
router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });
    res.json({ success: true, barber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/barbers - admin creates barber
router.post('/', protect, admin, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, phone, specializations, experience, bio, workingHours } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    let profileImage = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'salon/barbers');
      profileImage = result.secure_url;
    }

    const user = await User.create({ name, email, password: password || 'barber123', phone, role: 'barber' });
    const specs = typeof specializations === 'string' ? JSON.parse(specializations) : (specializations || []);
    const wh = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    const barber = await Barber.create({
      user: user._id, specializations: specs, experience: experience || 0, bio: bio || '', profileImage,
      ...(wh && { workingHours: wh }),
    });

    await barber.populate('user', 'name email phone avatar');
    res.status(201).json({ success: true, barber, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/barbers/:id
router.put('/:id', protect, admin, upload.single('profileImage'), async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    const { name, phone, isAvailable, specializations, experience, bio, workingHours } = req.body;
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'salon/barbers');
      barber.profileImage = result.secure_url;
    }

    if (name || phone) await User.findByIdAndUpdate(barber.user, { name, phone });
    if (specializations) barber.specializations = typeof specializations === 'string' ? JSON.parse(specializations) : specializations;
    if (experience !== undefined) barber.experience = experience;
    if (bio !== undefined) barber.bio = bio;
    if (isAvailable !== undefined) barber.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (workingHours) barber.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;

    await barber.save();
    await barber.populate('user', 'name email phone avatar');
    res.json({ success: true, barber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/barbers/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });
    await User.findByIdAndUpdate(barber.user, { isActive: false });
    barber.isAvailable = false;
    await barber.save();
    res.json({ success: true, message: 'Barber deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
