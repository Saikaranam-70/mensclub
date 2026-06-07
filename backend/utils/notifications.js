const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./email');

const createNotification = async ({ userId, title, message, type, relatedBooking, data }) => {
  try {
    const notification = await Notification.create({ user: userId, title, message, type, relatedBooking, data: data || {} });
    // Emit real-time notification via socket
    if (global.io) {
      global.io.to(userId.toString()).emit('notification', {
        _id: notification._id,
        title,
        message,
        type,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    // Send email notification to user
    try {
      const user = await User.findById(userId, 'email name');
      if (user && user.email) {
        sendEmail({
          to: user.email,
          subject: `🔔 SalonPro: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #d4af37, #f5c842); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #111; font-size: 28px;">✂️ SalonPro</h1>
                <p style="margin: 5px 0 0; color: #333; font-size: 16px;">New Notification</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #ccc;">Hi <strong style="color: #d4af37;">${user.name}</strong>,</p>
                <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
                  <h4 style="color: #d4af37; margin-top: 0; font-size: 16px;">${title}</h4>
                  <p style="margin: 8px 0; color: #ccc; font-size: 14px; line-height: 1.6;">${message}</p>
                </div>
                <p style="color: #888; font-size: 13px;">To manage your settings or view all notifications, log into your account.</p>
              </div>
              <div style="background: #1a1a1a; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 SalonPro. All rights reserved.</p>
              </div>
            </div>
          `
        }).catch(err => console.error('Email sending promise rejected:', err.message));
      }
    } catch (emailErr) {
      console.error('Error fetching user for email notification:', emailErr.message);
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotification };
