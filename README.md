# ✂️ SalonPro — Full Stack MERN Salon Management System

A **production-ready**, premium salon management platform with guest PIN-based booking (like Rapido), real-time notifications, admin panel, and dark/light themes.

---

## 🚀 Features

### Customer (Guest — No Login Required)
- 🔐 **PIN-Based Booking** — Enter name + phone, get a unique 6-digit PIN
- 📋 Track bookings anytime using phone number or PIN
- ✂️ Browse services with pricing & duration
- 💈 Choose preferred barber with ratings
- 📅 Real-time slot availability based on barber schedule + service duration
- 🌙 Dark / Light theme toggle

### Customer (Registered Member)
- Everything above, plus:
- 🔔 Real-time push notifications (WebSocket)
- 📧 Email confirmations & reminders
- ⭐ Leave reviews after completed sessions
- 📊 Full booking history with PIN display
- 👤 Profile management

### Barber
- 📅 Daily schedule view
- 🔑 **Verify client PIN** to start session (Rapido-style)
- Earnings & completed sessions tracking

### Admin Panel
- 📊 **Dashboard** with live charts (bookings, revenue, trends)
- 📅 **Bookings** — filter by date/barber/status, verify PINs, update status
- ✂️ **Services** — CRUD with image upload, pricing, expected duration, buffer time
- 💈 **Barbers** — Add/edit team, working hours per day, specializations
- 🖼️ **Gallery** — Drag-and-drop image upload via Cloudinary, featured images
- 👥 **Users** — View, search, activate/deactivate
- 📢 **Broadcast Notifications** — Send to all users with templates
- ⚙️ **Settings** — Salon info, opening hours, booking rules, logo/branding upload

---

## 📁 Project Structure

```
salon-app/
├── backend/
│   ├── models/          User, Barber, Booking, Service, Notification, Gallery, SalonSettings
│   ├── routes/          auth, bookings, barbers, services, slots, notifications, gallery, admin, dashboard
│   ├── middleware/       auth.js (JWT protect, admin, barberOrAdmin)
│   ├── utils/           slots.js, email.js, notifications.js
│   ├── config/          cloudinary.js
│   ├── seed.js          Database seeder
│   └── server.js        Express + Socket.io
│
└── frontend/
    └── src/
        ├── context/     AuthContext, ThemeContext, NotificationContext (WebSocket)
        ├── services/    api.js (all API calls)
        ├── components/  Navbar, Footer, Layout
        └── pages/
            ├── HomePage, ServicesPage, BarbersPage, GalleryPage
            ├── GuestBookingPage  ← PIN-based, no login needed
            ├── BookingPage       ← Member booking (logged in)
            ├── LoginPage, RegisterPage, ProfilePage
            ├── MyBookingsPage, NotificationsPage, BookingSuccessPage
            └── admin/
                ├── AdminLayout (sidebar)
                ├── AdminDashboard, AdminBookings, AdminServices
                ├── AdminBarbers, AdminGallery, AdminUsers
                ├── AdminSettings, AdminNotifications
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for image uploads

### 1. Clone & Install

```bash
# Install both backend and frontend
npm run install:all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary keys, email config
```

### 3. Seed Database

```bash
npm run seed
# Creates: admin, demo user, 4 barbers, 12 services, salon settings
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

Open http://localhost:3000

---

## 🐳 Docker (Full Stack)

```bash
cp backend/.env.example backend/.env
# Edit .env

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

---

## 🔑 Demo Credentials

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@salon.com     | admin123  |
| User  | user@salon.com      | user1234  |
| Barber| arjun@salonpro.com  | barber123 |

---

## 🔐 Guest PIN Booking Flow

```
Guest visits /book-guest
  → Enters name + phone
  → Selects service (sees price + duration)
  → Chooses barber (sees ratings)
  → Picks date → available slots shown in real-time
  → Confirms
  → Receives 6-digit PIN  ← like Rapido!

On arrival at salon:
  → Barber asks for PIN
  → Admin/Barber verifies PIN in dashboard
  → Session starts automatically

Track booking anytime:
  → Visit /book-guest → "Track My Booking"
  → Enter PIN or phone number
```

---

## 🧩 Smart Slot Generation

Slots are computed dynamically:
- Based on **barber's working hours** for the selected day
- Service **duration + buffer time** defines slot size
- Already-booked slots are excluded in real-time
- Past slots filtered out for today

---

## 🔔 Real-Time Notifications

WebSocket (Socket.io) pushes notifications instantly:
- Booking confirmed / cancelled / started / completed
- Admin broadcast messages
- Stored in DB for offline users

---

## 📡 API Overview

```
POST   /api/bookings/guest          Guest booking (no auth)
POST   /api/bookings/guest/lookup   Track by PIN or phone
POST   /api/bookings/verify-pin     Barber verifies client PIN
GET    /api/slots/available         Real-time slot availability
GET    /api/services                All active services
GET    /api/barbers                 All available barbers
POST   /api/auth/register           Register
POST   /api/auth/login              Login
GET    /api/dashboard/stats         Admin dashboard stats
POST   /api/notifications/broadcast Admin broadcast
PUT    /api/admin/settings          Update salon settings
```

---

## 🎨 Tech Stack

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| Frontend  | React 18, React Router 6, Recharts, Socket.io |
| Styling   | Pure CSS Variables (dark/light themes)        |
| Backend   | Node.js, Express 4, Socket.io                 |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT (30-day tokens)                           |
| Images    | Cloudinary (multer memory storage)            |
| Email     | Nodemailer (Gmail SMTP)                       |
| Real-time | Socket.io WebSockets                          |
| Deploy    | Docker + Nginx + docker-compose               |

---

## 📝 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/salon_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=SalonPro <your@gmail.com>

CLIENT_URL=http://localhost:3000
```

---

Built with ❤️ — SalonPro © 2024
