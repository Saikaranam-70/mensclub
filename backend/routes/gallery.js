const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @GET /api/gallery - public
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    const images = await Gallery.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/gallery - admin upload
router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    const { title, category, isFeatured } = req.body;
    const uploaded = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'salon/gallery');
      const image = await Gallery.create({
        title, category: category || 'other',
        imageUrl: result.secure_url,
        publicId: result.public_id,
        isFeatured: isFeatured === 'true',
        uploadedBy: req.user._id,
      });
      uploaded.push(image);
    }
    res.status(201).json({ success: true, images: uploaded });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/gallery/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/gallery/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (image && image.publicId) await deleteFromCloudinary(image.publicId);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
