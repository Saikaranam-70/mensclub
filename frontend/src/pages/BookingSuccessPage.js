import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

export default function BookingSuccessPage() {
  const { state } = useLocation();
  if (!state?.booking) return <Navigate to="/" replace />;
  const b = state.booking;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✅</div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>See you soon. Show your PIN to the barber on arrival.</p>

        <div style={{ background: 'var(--surface)', border: '2px solid var(--gold)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your Session PIN</div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '0.25em', color: 'var(--gold)', fontFamily: 'DM Sans' }}>{b.pin}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Share this PIN with your barber to start session</div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, textAlign: 'left', marginBottom: 24 }}>
          {[
            ['Booking ID', b.bookingId],
            ['Service',   b.service?.name],
            ['Barber',    b.barber?.user?.name],
            ['Date',      new Date(b.date).toDateString()],
            ['Time',      `${b.startTime} – ${b.endTime}`],
            ['Amount',    `₹${b.price}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 15 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/my-bookings" className="btn btn-outline" style={{ flex: 1 }}>My Bookings</Link>
          <Link to="/" className="btn btn-gold" style={{ flex: 1 }}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
