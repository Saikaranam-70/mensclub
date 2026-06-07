import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { servicesAPI, barbersAPI, slotsAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Scissors, Calendar, Clock, ChevronRight, ChevronLeft, CheckCircle, Star } from 'lucide-react';

const STEPS = ['Service', 'Barber', 'Date & Time', 'Confirm'];

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ serviceId: '', barberId: '', date: '', startTime: '', notes: '' });
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filteredServices = categoryFilter === 'all' ? services : services.filter(s => s.category === categoryFilter);

  const validate = () => {
    if (step === 0 && !form.serviceId) { toast.error('Please select a service'); return false; }
    if (step === 1 && !form.barberId)  { toast.error('Please choose a barber');  return false; }
    if (step === 2) {
      if (!form.date)      { toast.error('Select a date');      return false; }
      if (!form.startTime) { toast.error('Select a time slot'); return false; }
    }
    return true;
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.create(form);
      toast.success('Booking confirmed! 🎉');
      navigate('/book/success', { state: { booking: res.data.booking } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 20, padding: '6px 16px', marginBottom: 16, fontSize: 13, color: 'var(--gold)' }}>
            <Scissors size={13} /> Member Booking
          </div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700 }}>Book Your Appointment</h1>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? 'var(--gold)' : i === step ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'var(--surface)',
                  border: i <= step ? 'none' : '2px solid var(--border)',
                  color: i <= step ? '#0a0a0a' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 13, transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className="step-label" style={{ fontSize: 11, marginTop: 5, color: i === step ? 'var(--gold)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</div>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--gold)' : 'var(--border)', margin: '0 8px', marginBottom: 18, transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 20 }}>

          {/* STEP 0 — Service */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Choose a Service</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`btn btn-sm ${categoryFilter === cat ? 'btn-gold' : 'btn-outline'}`}
                    style={{ textTransform: 'capitalize' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredServices.map(s => (
                  <label key={s._id} style={{ cursor: 'pointer' }}>
                    <input type="radio" name="service" value={s._id} checked={form.serviceId === s._id}
                      onChange={() => { setForm({ ...form, serviceId: s._id, barberId: '', startTime: '' }); setSelectedService(s); setSelectedBarber(null); }}
                      style={{ display: 'none' }} />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', borderRadius: 14,
                      border: `2px solid ${form.serviceId === s._id ? 'var(--gold)' : 'var(--border)'}`,
                      background: form.serviceId === s._id ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {s.image && <img src={s.image} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10 }} />}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                            {s.name}
                            {s.isPopular && <span className="badge badge-gold" style={{ fontSize: 10 }}>Popular</span>}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>{s.description} · {s.duration} min</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--gold)' }}>₹{s.price}</div>
                        {form.serviceId === s._id && <CheckCircle size={20} color="var(--gold)" />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Barber */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Choose Your Barber</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {barbers.map(b => (
                  <label key={b._id} style={{ cursor: 'pointer' }}>
                    <input type="radio" name="barber" value={b._id} checked={form.barberId === b._id}
                      onChange={() => { setForm({ ...form, barberId: b._id, startTime: '' }); setSelectedBarber(b); }}
                      style={{ display: 'none' }} />
                    <div style={{
                      padding: 20, borderRadius: 16, textAlign: 'center',
                      border: `2px solid ${form.barberId === b._id ? 'var(--gold)' : 'var(--border)'}`,
                      background: form.barberId === b._id ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s', position: 'relative',
                    }}>
                      {form.barberId === b._id && (
                        <div style={{ position: 'absolute', top: 10, right: 10 }}><CheckCircle size={18} color="var(--gold)" /></div>
                      )}
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700, fontSize: 24, color: '#0a0a0a', overflow: 'hidden' }}>
                        {b.profileImage ? <img src={b.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : b.user?.name?.[0]}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{b.user?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{b.experience} yrs exp</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 8 }}>
                        {(b.specializations || []).slice(0, 2).map(sp => (
                          <span key={sp} className="badge badge-gray" style={{ fontSize: 10 }}>{sp}</span>
                        ))}
                      </div>
                      {b.rating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10, fontSize: 13, color: 'var(--gold)' }}>
                          <Star size={12} fill="var(--gold)" /> {b.rating.toFixed(1)}
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({b.totalReviews})</span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Date & Time */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Pick Date & Time</h2>
              <div className="form-group">
                <label className="form-label"><Calendar size={14} style={{ marginRight: 6 }} />Date</label>
                <input type="date" className="form-input" value={form.date} min={minDate} max={maxDate}
                  onChange={e => setForm({ ...form, date: e.target.value, startTime: '' })} style={{ fontSize: 15 }} />
              </div>
              {form.date && (
                <>
                  <label className="form-label" style={{ display: 'block', marginBottom: 12 }}><Clock size={14} style={{ marginRight: 6 }} />Available Slots ({selectedService?.duration} min each)</label>
                  {slots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                      No slots available for this date. Try another.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
                      {slots.map(slot => (
                        <button key={slot.start} onClick={() => setForm({ ...form, startTime: slot.start })}
                          style={{
                            padding: '10px 6px', borderRadius: 10, fontSize: 14, fontWeight: form.startTime === slot.start ? 700 : 400,
                            border: `2px solid ${form.startTime === slot.start ? 'var(--gold)' : 'var(--border)'}`,
                            background: form.startTime === slot.start ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                            color: form.startTime === slot.start ? 'var(--gold)' : 'var(--text-primary)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any special requests…" rows={3} style={{ resize: 'vertical' }} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Confirm Booking</h2>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                {[
                  ['Service', `${selectedService?.name} (${selectedService?.duration} min)`],
                  ['Barber',  selectedBarber?.user?.name],
                  ['Date',    form.date ? new Date(form.date).toDateString() : ''],
                  ['Time',    form.startTime],
                  ['Price',   `₹${selectedService?.price}`],
                  ['Notes',   form.notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 15 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 12, padding: 14, fontSize: 14, color: 'var(--gold)' }}>
                🔐 A <strong>6-digit PIN</strong> will be sent to your notifications. Show it to your barber when you arrive.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn btn-outline" style={{ flex: 1, opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={18} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => { if (validate()) setStep(s => s + 1); }} className="btn btn-gold" style={{ flex: 2 }}>
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleBook} className="btn btn-gold" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Confirming…' : '✅ Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
