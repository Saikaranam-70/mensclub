/**
 * SalonPro - Database Seeder for MEN'S CLUB BARBER SHOP
 * Run: node seed.js
 * Seeds: admin user, barbers, services, sample gallery, salon settings, and dummy reviews
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User           = require('./models/User');
const Barber         = require('./models/Barber');
const Service        = require('./models/Service');
const Gallery        = require('./models/Gallery');
const SalonSettings  = require('./models/SalonSettings');
const Booking        = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_db';

const services = [
  { name: 'Classic Haircut',        category: 'haircut',        price: 199, duration: 30, bufferTime: 5,  isPopular: true,  description: 'Timeless scissor cut styled to perfection.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800' },
  { name: 'Fade & Taper',           category: 'haircut',        price: 249, duration: 40, bufferTime: 5,  isPopular: true,  description: 'Clean fade with a sharp taper for the modern look.', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800' },
  { name: 'Beard Trim & Shape',     category: 'beard',          price: 149, duration: 20, bufferTime: 5,  isPopular: false, description: 'Precision beard shaping and line-up.', image: 'https://images.unsplash.com/photo-1599351431247-f5094087e84a?auto=format&fit=crop&q=80&w=800' },
  { name: 'Beard + Haircut Combo',  category: 'combo',          price: 349, duration: 60, bufferTime: 10, isPopular: true,  description: 'Full grooming package — cut + beard in one session.', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800' },
  { name: 'Hot Towel Shave',        category: 'beard',          price: 199, duration: 30, bufferTime: 5,  isPopular: false, description: 'Classic straight-razor shave with a luxurious hot towel.', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Hair Coloring',          category: 'coloring',       price: 799, duration: 90, bufferTime: 15, isPopular: false, description: 'Full color or highlights with professional-grade dye.', image: 'https://images.unsplash.com/photo-1605497746444-ac9dba45253a?auto=format&fit=crop&q=80&w=800' },
  { name: 'Highlights',             category: 'coloring',       price: 599, duration: 75, bufferTime: 15, isPopular: false, description: 'Streak highlights for dimension and depth.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Scalp Treatment',        category: 'hair_treatment', price: 399, duration: 45, bufferTime: 10, isPopular: false, description: 'Deep-cleanse scalp therapy with nourishing serums.', image: 'https://images.unsplash.com/photo-1517832606589-7a598b647192?auto=format&fit=crop&q=80&w=800' },
  { name: 'Hair Spa',               category: 'hair_treatment', price: 499, duration: 60, bufferTime: 10, isPopular: false, description: 'Rejuvenating hair spa with steam and protein mask.', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' },
  { name: 'Kids Haircut (U/12)',    category: 'haircut',        price: 149, duration: 20, bufferTime: 5,  isPopular: false, description: 'Fun, friendly cut for kids under 12.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800' },
  { name: 'Styling & Blow-dry',     category: 'styling',        price: 299, duration: 30, bufferTime: 5,  isPopular: false, description: 'Professional blow-dry and styling finish.', image: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&q=80&w=800' },
  { name: 'Royal Grooming Package', category: 'combo',          price: 699, duration: 90, bufferTime: 15, isPopular: true,  description: 'Head-to-toe: haircut + beard + hot towel + scalp massage.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800' },
];

const barberProfiles = [
  {
    name: 'Arjun Mehta',  email: 'arjun@mensclub.com',  phone: '9110578819',
    specializations: ['Fade', 'Beard Sculpting', 'Classic Cuts'],
    experience: 8, bio: 'Master barber with 8 years of premium grooming experience. Specialises in fades and creative designs.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    workingHours: {
      monday: { start: '09:00', end: '20:00', off: false }, tuesday:  { start: '09:00', end: '20:00', off: false },
      wednesday:{ start: '09:00', end: '20:00', off: false }, thursday: { start: '09:00', end: '20:00', off: false },
      friday:  { start: '09:00', end: '20:00', off: false }, saturday: { start: '09:00', end: '18:00', off: false },
      sunday:  { start: '10:00', end: '14:00', off: true  },
    },
  },
  {
    name: 'Rahul Sharma', email: 'rahul@mensclub.com',  phone: '9110578820',
    specializations: ['Coloring', 'Hair Spa', 'Styling'],
    experience: 5, bio: 'Colour expert and texture specialist. Passionate about transforming hair with vibrant, long-lasting colour.',
    profileImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400',
    workingHours: {
      monday: { start: '10:00', end: '20:00', off: false }, tuesday:  { start: '10:00', end: '20:00', off: false },
      wednesday:{ start: '10:00', end: '20:00', off: false }, thursday: { start: '10:00', end: '20:00', off: true  },
      friday:  { start: '10:00', end: '20:00', off: false }, saturday: { start: '09:00', end: '19:00', off: false },
      sunday:  { start: '10:00', end: '15:00', off: false },
    },
  },
  {
    name: 'Priya Nair',   email: 'priya@mensclub.com',  phone: '9110578821',
    specializations: ['Scissor Cuts', 'Kids Cuts', 'Hair Treatment'],
    experience: 6, bio: 'Gentle touch and creative flair — Priya creates timeless looks for every client.',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    workingHours: {
      monday: { start: '09:00', end: '18:00', off: false }, tuesday:  { start: '09:00', end: '18:00', off: false },
      wednesday:{ start: '09:00', end: '18:00', off: true  }, thursday: { start: '09:00', end: '18:00', off: false },
      friday:  { start: '09:00', end: '18:00', off: false }, saturday: { start: '09:00', end: '17:00', off: false },
      sunday:  { start: '10:00', end: '14:00', off: false },
    },
  },
  {
    name: 'Dev Kapoor',   email: 'dev@mensclub.com',    phone: '9110578822',
    specializations: ['Hot Towel Shave', 'Beard Design', 'Fade'],
    experience: 10, bio: 'A decade of experience in precision barbering. Dev\'s hot-towel shaves are legendary.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    workingHours: {
      monday: { start: '11:00', end: '21:00', off: false }, tuesday:  { start: '11:00', end: '21:00', off: false },
      wednesday:{ start: '11:00', end: '21:00', off: false }, thursday: { start: '11:00', end: '21:00', off: false },
      friday:  { start: '11:00', end: '21:00', off: false }, saturday: { start: '10:00', end: '19:00', off: false },
      sunday:  { start: '00:00', end: '00:00', off: true  },
    },
  },
];

const galleryLooks = [
  { title: 'Textured Pompadour Fade', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800', category: 'haircut', isFeatured: true },
  { title: 'Crisp Beard Line-up & Fade', imageUrl: 'https://images.unsplash.com/photo-1599351431247-f5094087e84a?auto=format&fit=crop&q=80&w=800', category: 'beard', isFeatured: true },
  { title: 'Mid Skin Fade with Curly Top', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', category: 'haircut', isFeatured: true },
  { title: 'Classic Slick Back Styling', imageUrl: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&q=80&w=800', category: 'styling', isFeatured: true },
  { title: 'Vibrant Highlights', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800', category: 'coloring', isFeatured: false },
  { title: 'Nourishing Scalp & Beard Treatment', imageUrl: 'https://images.unsplash.com/photo-1517832606589-7a598b647192?auto=format&fit=crop&q=80&w=800', category: 'salon', isFeatured: false },
];

const reviewerNames = [
  { name: 'Vikram Sen', email: 'vikram@gmail.com' },
  { name: 'Ritesh Reddy', email: 'ritesh@gmail.com' },
  { name: 'Sunny Rao', email: 'sunny@gmail.com' },
  { name: 'Anil Kumar', email: 'anil@gmail.com' },
  { name: 'Kiran Varma', email: 'kiran@gmail.com' },
  { name: 'Sai Teja', email: 'saiteja@gmail.com' },
  { name: 'Pranav Joshi', email: 'pranav@gmail.com' },
  { name: 'Naresh Chowdary', email: 'naresh@gmail.com' }
];

const reviewsPool = [
  { rating: 5, review: 'Fantastic service! Arjun gave me a perfect mid skin fade. The attention to detail here is on another level. Definitely my new go-to place.' },
  { rating: 5, review: 'The hot towel shave by Dev was absolute heaven. Very clean, hygienic, and professional environment. Fully worth it!' },
  { rating: 5, review: 'Best salon in Anand Nagar! Took the Combo package and I am completely satisfied. Highly recommended for premium grooming.' },
  { rating: 4, review: 'Great haircut and beard trimming. Priya is extremely skillful and patient. Will visit again.' },
  { rating: 5, review: 'Very premium vibe! They treat you like royalty. Rahul did an excellent job styling my hair for an event. Got so many compliments!' },
  { rating: 5, review: 'Men\'s Club is class apart. The booking app is super convenient, I walked in and got seated immediately. High quality cuts.' },
  { rating: 4, review: 'Extremely polite staff. The shop is beautifully designed and very clean. Hair coloring was perfectly done.' },
  { rating: 5, review: 'Top notch grooming experience! The detail in their work is unmatched. Hands down the best shop in Visakhapatnam.' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connected');

    // ── Wipe existing data ──
    await Promise.all([
      User.deleteMany({}), Barber.deleteMany({}), Service.deleteMany({}),
      Gallery.deleteMany({}), SalonSettings.deleteMany({}), Booking.deleteMany({})
    ]);
    console.log('🗑   Cleared existing data');

    // ── Admin ──
    const admin = await User.create({
      name: 'Men\'s Club Admin', email: 'admin@mensclub.com',
      password: 'admin123', role: 'admin', isActive: true,
    });
    console.log('👑  Admin created  →  admin@mensclub.com / admin123');

    // ── Demo user ──
    const demoUser = await User.create({
      name: 'Demo Client', email: 'user@mensclub.com',
      password: 'user1234', role: 'user', isActive: true, phone: '9000000001',
    });
    console.log('👤  User created   →  user@mensclub.com / user1234');

    // ── Services ──
    const createdServices = await Service.insertMany(services);
    console.log(`✂️   ${createdServices.length} services seeded`);

    // ── Barbers ──
    const seededBarbers = [];
    for (const bp of barberProfiles) {
      const { name, email, phone, specializations, experience, bio, workingHours, profileImage } = bp;
      const bUser = await User.create({ name, email, phone, password: 'barber123', role: 'barber', isActive: true });
      const barber = await Barber.create({ user: bUser._id, specializations, experience, bio, workingHours, profileImage, isAvailable: true });
      seededBarbers.push(barber);
    }
    console.log(`💈  ${barberProfiles.length} barbers seeded  (password: barber123)`);

    // ── Gallery Looks ──
    const createdGallery = await Gallery.insertMany(
      galleryLooks.map(gl => ({ ...gl, uploadedBy: admin._id }))
    );
    console.log(`🖼️   ${createdGallery.length} gallery images seeded`);

    // ── Dummy Reviews (Completed Bookings) ──
    console.log('📝  Seeding dummy reviews...');
    const createdReviewers = [];
    for (const r of reviewerNames) {
      const user = await User.create({
        name: r.name, email: r.email, password: 'user1234', role: 'user', isActive: true
      });
      createdReviewers.push(user);
    }

    const reviewBookings = [];
    for (let i = 0; i < reviewsPool.length; i++) {
      const pool = reviewsPool[i];
      const reviewer = createdReviewers[i % createdReviewers.length];
      const barber = seededBarbers[i % seededBarbers.length];
      const service = createdServices[i % createdServices.length];
      
      const date = new Date();
      date.setDate(date.getDate() - (i + 1)); // completed a few days ago
      
      const booking = await Booking.create({
        user: reviewer._id,
        barber: barber._id,
        service: service._id,
        date: date,
        startTime: '11:00',
        endTime: '11:30',
        status: 'completed',
        price: service.price,
        rating: pool.rating,
        review: pool.review,
        reviewedAt: date,
      });
      reviewBookings.push(booking);
    }
    console.log(`⭐  Seeded ${reviewBookings.length} completed bookings with reviews.`);

    // ── Update Barber Ratings ──
    for (const barber of seededBarbers) {
      const reviews = await Booking.find({ barber: barber._id, status: 'completed', rating: { $exists: true } });
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 5.0;
      
      barber.rating = avgRating;
      barber.totalReviews = totalReviews;
      barber.completedBookings = totalReviews;
      await barber.save();
    }
    console.log('🔄  Barber ratings and reviews computed and updated.');

    // ── Salon settings ──
    await SalonSettings.create({
      salonName: 'MEN\'S CLUB BARBER SHOP',
      tagline: 'Premium Barbering & Grooming Studio',
      address: 'Anand Nagar, Pothinamallayya Palem, Potinamallayyapalem, Andhra Pradesh 530041',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.7348085682374!2d83.34671547370043!3d17.80415629066815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b9a868af8fd%3A0x956d9b81eb3ef39b!2sMEN&#39;S%20CLUB%20BARBER%20SHOP!5e0!3m2!1sen!2sin!4v1780814146539!5m2!1sen!2sin',
      phone: '091105 78818',
      email: 'hello@mensclubbarbershop.com',
      about: 'MEN\'S CLUB BARBER SHOP is Vizag\'s premier destination for gentlemen\'s grooming. Located in Pothinamallayya Palem, we deliver master-class haircutting, beard styling, and luxury grooming experiences. Our space is engineered for the modern man who values precision and style.',
      openingHours: {
        monday:    { open: '09:00', close: '20:00', closed: false },
        tuesday:   { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday:  { open: '09:00', close: '20:00', closed: false },
        friday:    { open: '09:00', close: '20:00', closed: false },
        saturday:  { open: '09:00', close: '18:00', closed: false },
        sunday:    { open: '10:00', close: '14:00', closed: false },
      },
      socialMedia: { instagram: 'https://instagram.com/mensclubbarbershop', facebook: 'https://facebook.com/mensclubbarbershop', twitter: 'https://twitter.com/mensclubbarber' },
      bookingSettings: { advanceBookingDays: 30, minAdvanceHours: 1, autoConfirm: true, allowCancellation: true, cancellationHours: 2 },
    });
    console.log('⚙️   Salon settings seeded');

    console.log('\n🎉  Seeding complete!\n');
    console.log('  Admin  →  admin@mensclub.com  / admin123');
    console.log('  User   →  user@mensclub.com   / user1234');
    console.log('  Barbers (login) → their email / barber123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  }
}

seed();
