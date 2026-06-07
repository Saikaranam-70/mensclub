const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SalonPro <noreply@salonpro.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

const bookingConfirmationEmail = (booking, user, barber, service) => ({
  to: user.email,
  subject: `✅ Booking Confirmed - ${service.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #d4af37, #f5c842); padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #111; font-size: 28px;">✂️ SalonPro</h1>
        <p style="margin: 5px 0 0; color: #333; font-size: 16px;">Booking Confirmed!</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #ccc;">Hi <strong style="color: #d4af37;">${user.name}</strong>, your booking is confirmed!</p>
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Booking Details</h3>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Booking ID:</strong> ${booking.bookingId}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Service:</strong> ${service.name}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Barber:</strong> ${barber.user?.name || 'Your Stylist'}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Date:</strong> ${new Date(booking.date).toDateString()}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Price:</strong> ₹${booking.price}</p>
        </div>
        <p style="color: #888; font-size: 14px;">Please arrive 5 minutes early. To cancel or reschedule, login to your account.</p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 SalonPro. All rights reserved.</p>
      </div>
    </div>
  `,
});

const bookingReminderEmail = (booking, user, barber, service) => ({
  to: user.email,
  subject: `⏰ Reminder: Your appointment tomorrow - ${service.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #d4af37, #f5c842); padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #111;">✂️ SalonPro</h1>
        <p style="margin: 5px 0 0; color: #333;">Appointment Reminder</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #ccc;">Hi <strong style="color: #d4af37;">${user.name}</strong>, just a reminder about your appointment tomorrow!</p>
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Service:</strong> ${service.name}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Date:</strong> ${new Date(booking.date).toDateString()}</p>
          <p style="margin: 8px 0; color: #ccc;"><strong style="color: #fff;">Time:</strong> ${booking.startTime}</p>
        </div>
        <p style="color: #888; font-size: 14px;">See you tomorrow! 💈</p>
      </div>
    </div>
  `,
});

module.exports = { sendEmail, bookingConfirmationEmail, bookingReminderEmail };
