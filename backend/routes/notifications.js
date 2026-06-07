const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// @GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/notifications/broadcast - admin broadcast
router.post('/broadcast', protect, admin, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const User = require('../models/User');
    const { sendEmail } = require('../utils/email');

    const users = await User.find({ isActive: true, role: 'user' }, '_id email name');
    const notifications = users.map(u => ({ user: u._id, title, message, type: type || 'promo' }));
    await Notification.insertMany(notifications);
    // Broadcast via socket
    if (global.io) {
      global.io.emit('notification', { title, message, type: type || 'promo', isRead: false, createdAt: new Date() });
    }

    // Send emails to all user recipients
    users.forEach(u => {
      if (u.email) {
        sendEmail({
          to: u.email,
          subject: `📢 SalonPro Announcement: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #d4af37, #f5c842); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #111; font-size: 28px;">✂️ SalonPro</h1>
                <p style="margin: 5px 0 0; color: #333; font-size: 16px;">New Announcement</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #ccc;">Hi <strong style="color: #d4af37;">${u.name || 'Valued Client'}</strong>,</p>
                <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
                  <h4 style="color: #d4af37; margin-top: 0; font-size: 18px;">${title}</h4>
                  <p style="margin: 8px 0; color: #ccc; font-size: 14px; line-height: 1.6;">${message}</p>
                </div>
                <p style="color: #888; font-size: 13px;">To manage your settings or view all notifications, log into your account.</p>
              </div>
              <div style="background: #1a1a1a; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 SalonPro. All rights reserved.</p>
              </div>
            </div>
          `
        }).catch(err => console.error(`Error sending broadcast email to ${u.email}:`, err.message));
      }
    });

    res.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
