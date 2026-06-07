import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Public pages
import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ServicesPage      from './pages/ServicesPage';
import BarbersPage       from './pages/BarbersPage';
import GalleryPage       from './pages/GalleryPage';
import GuestBookingPage  from './pages/GuestBookingPage';

// Auth-protected pages
import BookingPage       from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage    from './pages/MyBookingsPage';
import ProfilePage       from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// Admin pages
import AdminLayout        from './pages/admin/AdminLayout';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminServices      from './pages/admin/AdminServices';
import AdminBarbers       from './pages/admin/AdminBarbers';
import AdminBookings      from './pages/admin/AdminBookings';
import AdminGallery       from './pages/admin/AdminGallery';
import AdminUsers         from './pages/admin/AdminUsers';
import AdminSettings      from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"          element={<Layout><HomePage /></Layout>} />
        <Route path="/services"  element={<Layout><ServicesPage /></Layout>} />
        <Route path="/barbers"   element={<Layout><BarbersPage /></Layout>} />
        <Route path="/gallery"   element={<Layout><GalleryPage /></Layout>} />
        <Route path="/book-guest" element={<Layout><GuestBookingPage /></Layout>} />

        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* ── Member ── */}
        <Route path="/book"         element={<ProtectedRoute roles={['user']}><Layout><BookingPage /></Layout></ProtectedRoute>} />
        <Route path="/book/success" element={<ProtectedRoute roles={['user']}><Layout><BookingSuccessPage /></Layout></ProtectedRoute>} />
        <Route path="/my-bookings"  element={<ProtectedRoute roles={['user']}><Layout><MyBookingsPage /></Layout></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index               element={<AdminDashboard />} />
          <Route path="bookings"     element={<AdminBookings />} />
          <Route path="services"     element={<AdminServices />} />
          <Route path="barbers"      element={<AdminBarbers />} />
          <Route path="gallery"      element={<AdminGallery />} />
          <Route path="users"        element={<AdminUsers />} />
          <Route path="settings"     element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#d4af37', secondary: '#000' } },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
