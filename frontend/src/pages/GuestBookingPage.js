import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, barbersAPI, slotsAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scissors, User, Phone, Calendar, Clock, ChevronRight, ChevronLeft, CheckCircle, Search, Star } from 'lucide-react';

const STEPS = ['Your Info', 'Pick Service', 'Choose Barber', 'Select Slot', 'Confirm'];

export default function GuestBookingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [form, setForm] = useState({
    guestName: '', guestPhone: '',
    serviceId: '', barberId: '',
    date: '', startTime: '', notes: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber]   = useState(null);

  // lookup existing bookings by phone
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupPin,   setLookupPin]   = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupMode, setLookupMode]   = useState(false);

  useEffect(() => {
    servicesAPI.getAll().then(r => setServices(r.data.services || [])).catch(() => {});
    barbersAPI.getAll().then(r => setBarbers(r.data.barbers || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.serviceId && form.barberId && form.date) {
      slotsAPI.getAvailable({ serviceId: form.serviceId, barberId: form.barberId, date: form.date })
        .then(r => setSlots(r.data.slots || [])).catch(() => setSlots([]));
    }
  }, [form.serviceId, form.barberId, form.date]);

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const validateStep = () => {
    if (step === 0) {
      if (!form.guestName.trim()) { toast.error('Please enter your name'); return false; }
      if (!form.guestPhone.trim() || form.guestPhone.length < 10) { toast.error('Valid phone number required'); return false; }
    }
    if (step === 1 && !form.serviceId) { toast.error('Please select a service'); return false; }
    if (step === 2 && !form.barberId)  { toast.error('Please choose a barber'); return false; }
    if (step === 3) {
      if (!form.date)      { toast.error('Please select a date'); return false; }
      if (!form.startTime) { toast.error('Please select a time slot'); return false; }
    }
    return true;
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bookings/guest', form);
      setConfirmedBooking(res.data.booking);
      toast.success('Booking confirmed! Save your PIN 🔐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handleLookup = async () => {
    try {
      const res = await api.post('/bookings/guest/lookup', { phone: lookupPhone || undefined, pin: lookupPin || undefined });
      setLookupResult(res.data.bookings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No bookings found');
      setLookupResult([]);
    }
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 0);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  // ── Confirmed screen ──
  if (confirmedBooking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
            ✅
          </div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Show this PIN to your barber when you arrive.</p>

          {/* PIN display */}
          <div style={{ background: 'var(--surface)', border: '2px solid var(--gold)', borderRadius: 20, padding: 32, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your Session PIN</div>
            <div style={{
              fontSize: 56, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--gold)',
              fontFamily: 'DM Sans', textShadow: '0 0 40px rgba(212,175,55,0.3)',
            }}>{confirmedBooking.pin}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Share this PIN with your barber to start session</div>
          </div>

          {/* Details */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, textAlign: 'left', marginBottom: 24 }}>
            {[
              ['Booking ID', confirmedBooking.bookingId],
              ['Service',    confirmedBooking.service?.name],
              ['Barber',     confirmedBooking.barber?.user?.name],
              ['Date',       new Date(confirmedBooking.date).toDateString()],
              ['Time',       `${confirmedBooking.startTime} – ${confirmedBooking.endTime}`],
              ['Price',      `₹${confirmedBooking.price}`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--gold-border)', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 14, color: 'var(--gold)' }}>
            📱 <strong>Remember:</strong> You can check your booking status anytime with your phone number or PIN below.
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setConfirmedBooking(null); setStep(0); setForm({ guestName:'', guestPhone:'', serviceId:'', barberId:'', date:'', startTime:'', notes:'' }); setSelectedService(null); setSelectedBarber(null); }}
              className="btn btn-outline" style={{ flex: 1 }}>New Booking</button>
            <Link to="/" className="btn btn-gold" style={{ flex: 1 }}>Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 20, padding: '6px 16px', marginBottom: 16, fontSize: 13, color: 'var(--gold)' }}>
            <Scissors size={13} /> Guest Booking — No account needed
          </div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Book Your Session</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Just enter your name & phone. We'll give you a PIN to track everything.{' '}
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>or </span>
            <Link to="/login" style={{ color: 'var(--gold)', fontSize: 14 }}>sign in</Link>
          </p>
        </div>

        {/* Lookup toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button onClick={() => setLookupMode(false)} className={`btn ${!lookupMode ? 'btn-gold' : 'btn-outline'} btn-sm`}>📅 New Booking</button>
          <button onClick={() => setLookupMode(true)}  className={`btn ${lookupMode  ? 'btn-gold' : 'btn-outline'} btn-sm`}>🔍 Track My Booking</button>
        </div>

        {/* ── LOOKUP MODE ── */}
        {lookupMode ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 20 }}>Find Your Booking</h3>
            <div className="form-group">
              <label className="form-label">Enter PIN (6 digits)</label>
              <input className="form-input" value={lookupPin} onChange={e => setLookupPin(e.target.value)} placeholder="e.g. 483920" maxLength={6} style={{ letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' }} />
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '12px 0', fontSize: 13 }}>— or —</div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={lookupPhone} onChange={e => setLookupPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <button onClick={handleLookup} className="btn btn-gold" style={{ width: '100%' }}>
              <Search size={16} /> Find Booking
            </button>

            {lookupResult && (
              <div style={{ marginTop: 24 }}>
                {lookupResult.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No bookings found.</p>
                ) : lookupResult.map(b => (
                  <div key={b._id} style={{ background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)', padding: 20, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{b.bookingId}</span>
                      <span className={`badge badge-${b.status === 'confirmed' || b.status === 'pending' ? 'green' : b.status === 'cancelled' ? 'red' : b.status === 'completed' ? 'blue' : 'gold'}`}>
                        {b.status}
                      </span>
                    </div>
                    {[
                      ['Service',  b.service?.name],
                      ['Barber',   b.barber?.user?.name],
                      ['Date',     new Date(b.date).toDateString()],
                      ['Time',     `${b.startTime} – ${b.endTime}`],
                      ['PIN',      b.pin],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontWeight: k === 'PIN' ? 700 : 500, color: k === 'PIN' ? 'var(--gold)' : 'var(--text-primary)', letterSpacing: k === 'PIN' ? '0.15em' : 'normal' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── BOOKING FLOW ── */
          <div>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < STEPS.length - 1 ? 'none' : 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i < step ? 'var(--gold)' : i === step ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'var(--surface)',
                      border: i <= step ? 'none' : '2px solid var(--border)',
                      color: i <= step ? '#0a0a0a' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: 13, transition: 'all 0.3s',
                    }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <div className="step-label" style={{ fontSize: 11, marginTop: 6, color: i === step ? 'var(--gold)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < step ? 'var(--gold)' : 'var(--border)', margin: '0 6px', transition: 'background 0.3s', marginBottom: 20 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 24 }}>

              {/* STEP 0 — Guest Info */}
              {step === 0 && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 6 }}>Your Details</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>We only need your name & phone to book. No account required.</p>
                  <div className="form-group">
                    <label className="form-label"><User size={14} style={{ marginRight: 6 }} />Full Name</label>
                    <input className="form-input" value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} placeholder="John Doe" style={{ fontSize: 16 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={14} style={{ marginRight: 6 }} />Phone Number</label>
                    <input className="form-input" value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })} placeholder="+91 98765 43210" type="tel" style={{ fontSize: 16 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests or preferences…" rows={3} style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--gold)' }}>
                    🔐 After booking, you'll receive a <strong>6-digit PIN</strong>. Show it to your barber when you arrive — like Rapido!
                  </div>
                </div>
              )}

              {/* STEP 1 — Service */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 6 }}>Choose a Service</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Select the service you'd like today.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {services.map(s => (
                      <label key={s._id} style={{ cursor: 'pointer' }}>
                        <input type="radio" name="service" value={s._id} checked={form.serviceId === s._id}
                          onChange={() => { setForm({ ...form, serviceId: s._id, barberId: '', startTime: '' }); setSelectedService(s); }}
                          style={{ display: 'none' }} />
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '16px 20px', borderRadius: 14, border: `2px solid ${form.serviceId === s._id ? 'var(--gold)' : 'var(--border)'}`,
                          background: form.serviceId === s._id ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                          transition: 'all 0.2s',
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {s.name}
                              {s.isPopular && <span className="badge badge-gold" style={{ fontSize: 10 }}>Popular</span>}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>{s.description} · {s.duration} min</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--gold)' }}>₹{s.price}</div>
                            {form.serviceId === s._id && <CheckCircle size={18} color="var(--gold)" />}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 — Barber */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 6 }}>Choose Your Barber</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Pick a stylist for your session.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {barbers.map(b => (
                      <label key={b._id} style={{ cursor: 'pointer' }}>
                        <input type="radio" name="barber" value={b._id} checked={form.barberId === b._id}
                          onChange={() => { setForm({ ...form, barberId: b._id, startTime: '' }); setSelectedBarber(b); }}
                          style={{ display: 'none' }} />
                        <div style={{
                          padding: 20, borderRadius: 16, border: `2px solid ${form.barberId === b._id ? 'var(--gold)' : 'var(--border)'}`,
                          background: form.barberId === b._id ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                          textAlign: 'center', transition: 'all 0.2s',
                        }}>
                          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700, fontSize: 22, color: '#0a0a0a' }}>
                            {b.profileImage ? <img src={b.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : b.user?.name?.[0]}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{b.user?.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{b.experience} yrs exp</div>
                          {b.rating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, fontSize: 13, color: 'var(--gold)' }}>
                              <Star size={12} fill="var(--gold)" /> {b.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 — Date & Slot */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 6 }}>Pick Date & Time</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Slots are shown based on barber availability and service duration.</p>
                  <div className="form-group">
                    <label className="form-label"><Calendar size={14} style={{ marginRight: 6 }} />Date</label>
                    <input type="date" className="form-input" value={form.date} min={minDate} max={maxDate}
                      onChange={e => setForm({ ...form, date: e.target.value, startTime: '' })} style={{ fontSize: 15 }} />
                  </div>
                  {form.date && (
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: 12 }}><Clock size={14} style={{ marginRight: 6 }} />Available Slots</label>
                      {slots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                          No slots available for this date. Try another date.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10 }}>
                          {slots.map(slot => (
                            <button key={slot.start} onClick={() => setForm({ ...form, startTime: slot.start })}
                              style={{
                                padding: '10px 6px', borderRadius: 10, border: `2px solid ${form.startTime === slot.start ? 'var(--gold)' : 'var(--border)'}`,
                                background: form.startTime === slot.start ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                                color: form.startTime === slot.start ? 'var(--gold)' : 'var(--text-primary)',
                                fontWeight: form.startTime === slot.start ? 700 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                              }}>
                              {slot.start}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 — Confirm */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 6 }}>Confirm Booking</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Review your details before confirming.</p>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                    {[
                      ['Name',    form.guestName],
                      ['Phone',   form.guestPhone],
                      ['Service', selectedService?.name + ` (${selectedService?.duration} min)`],
                      ['Barber',  selectedBarber?.user?.name],
                      ['Date',    form.date ? new Date(form.date).toDateString() : ''],
                      ['Time',    form.startTime],
                      ['Price',   `₹${selectedService?.price}`],
                      ['Notes',   form.notes || '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 15 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 12, padding: 16, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
                    🔐 A <strong>6-digit PIN</strong> will be generated after confirmation. Show it to your barber on arrival. You can look up your booking anytime using your phone number.
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              <button onClick={prev} disabled={step === 0} className="btn btn-outline" style={{ flex: 1, opacity: step === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={18} /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="btn btn-gold" style={{ flex: 2 }}>
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleConfirm} className="btn btn-gold" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Confirming…' : '🎯 Confirm Booking'}
                </button>
              )}
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
              Want reminders & history? <Link to="/register" style={{ color: 'var(--gold)' }}>Create a free account</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
