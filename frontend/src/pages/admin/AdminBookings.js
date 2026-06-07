import React, { useState, useEffect, useCallback } from 'react';
import { bookingsAPI, barbersAPI } from '../../services/api';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw, X, KeyRound, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTS = ['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
const STATUS_BADGE = { pending:'badge-gold', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red', in_progress:'badge-gold', no_show:'badge-red' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '', barberId: '', isGuest: '', search: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinModal, setPinModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [quickPinInput, setQuickPinInput] = useState('');
  const [lookupBooking, setLookupBooking] = useState(null);

  useEffect(() => { barbersAPI.getAll().then(r => setBarbers(r.data.barbers || [])); }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== '')) };
      const res = await bookingsAPI.getAdminAll(params);
      setBookings(res.data.bookings || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatusUpdate = async () => {
    try {
      await bookingsAPI.updateStatus(statusModal.id, { status: statusModal.status });
      toast.success('Status updated');
      setStatusModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleVerifyPin = async () => {
    try {
      const res = await api.post('/bookings/verify-pin', { bookingId: pinModal._id, pin: pinInput });
      toast.success(res.data.message || 'PIN verified! Session started ✂️');
      setPinModal(null);
      setPinInput('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Wrong PIN'); }
  };

  const handleQuickPinLookup = async () => {
    if (quickPinInput.trim().length !== 6) return toast.error('PIN must be 6 digits');
    try {
      const res = await bookingsAPI.getByPin(quickPinInput.trim());
      setLookupBooking(res.data.booking);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking not found');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700 }}>Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{total} total bookings</p>
        </div>
        <button onClick={fetch} className="btn btn-outline btn-sm"><RefreshCw size={15} /> Refresh</button>
      </div>

      {/* Quick PIN Lookup Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><KeyRound size={18} color="var(--gold)" /> Direct PIN Lookup</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Instantly fetch a booking's full details by entering its 6-digit PIN.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%', maxWidth: 320 }}>
          <input type="text" className="form-input" placeholder="000000" maxLength={6}
            value={quickPinInput} onChange={e => setQuickPinInput(e.target.value)}
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center' }} />
          <button onClick={handleQuickPinLookup} className="btn btn-gold" disabled={quickPinInput.length !== 6} style={{ height: 44 }}>OK</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
          <label className="form-label">Search (Name, Phone, ID, PIN)</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" style={{ paddingLeft: 36 }}
              value={filters.search} onChange={e => { setFilters({...filters, search: e.target.value}); setPage(1); }}
              placeholder="Search bookings..." />
          </div>
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 140px' }}>
          <label className="form-label">Status</label>
          <select className="form-input form-select" value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 160px' }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={filters.date} onChange={e => { setFilters({...filters, date: e.target.value}); setPage(1); }} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 160px' }}>
          <label className="form-label">Barber</label>
          <select className="form-input form-select" value={filters.barberId} onChange={e => { setFilters({...filters, barberId: e.target.value}); setPage(1); }}>
            <option value="">All Barbers</option>
            {barbers.map(b => <option key={b._id} value={b._id}>{b.user?.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 120px' }}>
          <label className="form-label">Type</label>
          <select className="form-input form-select" value={filters.isGuest} onChange={e => { setFilters({...filters, isGuest: e.target.value}); setPage(1); }}>
            <option value="">All</option>
            <option value="true">Guest</option>
            <option value="false">Member</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ status:'', date:'', barberId:'', isGuest:'', search:'' }); setPage(1); }} className="btn btn-ghost btn-sm"><X size={15} /> Clear</button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="table-wrap" style={{ marginBottom: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th><th>Client</th><th>Service</th><th>Barber</th>
                  <th>Date & Time</th><th>PIN</th><th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{b.bookingId}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>
                        {b.isGuest ? b.guestName : b.user?.name}
                        {b.isGuest && <span className="badge badge-gray" style={{ marginLeft: 6, fontSize: 10 }}>Guest</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.isGuest ? b.guestPhone : b.user?.email}</div>
                    </td>
                    <td style={{ fontSize: 14 }}>{b.service?.name}</td>
                    <td style={{ fontSize: 14 }}>{b.barber?.user?.name}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{format(new Date(b.date), 'dd MMM yyyy')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.startTime} – {b.endTime}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--gold)', letterSpacing: '0.1em' }}>{b.pin}</span>
                      {b.pinVerified && <div style={{ fontSize: 10, color: 'var(--green)' }}>✓ Verified</div>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>₹{b.price}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{b.status.replace('_',' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['pending','confirmed'].includes(b.status) && (
                          <button onClick={() => { setPinModal(b); setPinInput(''); }} className="btn btn-sm btn-outline" title="Verify PIN">
                            <KeyRound size={13} />
                          </button>
                        )}
                        <select className="form-input form-select" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                          value={b.status}
                          onChange={e => setStatusModal({ id: b._id, status: e.target.value })}>
                          {STATUS_OPTS.filter(s=>s).map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No bookings found.</div>}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`btn btn-sm ${page === p ? 'btn-gold' : 'btn-outline'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* PIN verify modal */}
      {pinModal && (
        <div className="modal-overlay" onClick={() => setPinModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><KeyRound size={18} color="var(--gold)" /> Verify Client PIN</h3>
              <button onClick={() => setPinModal(null)} className="btn btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 14 }}>
                <strong>{pinModal.isGuest ? pinModal.guestName : pinModal.user?.name}</strong> · {pinModal.service?.name} · {pinModal.startTime}
              </div>
              <div className="form-group">
                <label className="form-label">Ask client for their 6-digit PIN</label>
                <input className="form-input" value={pinInput} onChange={e => setPinInput(e.target.value)}
                  placeholder="000000" maxLength={6}
                  style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '0.3em' }} />
              </div>
              <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--gold)' }}>
                💡 Verifying the PIN will automatically mark the session as <strong>In Progress</strong>.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setPinModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleVerifyPin} className="btn btn-gold" disabled={pinInput.length !== 6}>
                <CheckCircle size={16} /> Verify & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status confirm modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Status Change</h3>
              <button onClick={() => setStatusModal(null)} className="btn btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Change booking status to <strong style={{ textTransform: 'capitalize', color: 'var(--gold)' }}>{statusModal.status}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setStatusModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleStatusUpdate} className="btn btn-gold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Lookup Detail Modal */}
      {lookupBooking && (
        <div className="modal-overlay" onClick={() => setLookupBooking(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={18} color="var(--gold)" /> Booking Details</h3>
              <button onClick={() => setLookupBooking(null)} className="btn btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, textAlign: 'left', marginBottom: 20 }}>
                {[
                  ['Booking ID', lookupBooking.bookingId],
                  ['Client Name', lookupBooking.isGuest ? lookupBooking.guestName : lookupBooking.user?.name],
                  ['Client Contact', lookupBooking.isGuest ? lookupBooking.guestPhone : lookupBooking.user?.phone || lookupBooking.user?.email],
                  ['Service', lookupBooking.service?.name],
                  ['Barber', lookupBooking.barber?.user?.name],
                  ['Date', new Date(lookupBooking.date).toDateString()],
                  ['Time', `${lookupBooking.startTime} – ${lookupBooking.endTime}`],
                  ['Price', `₹${lookupBooking.price}`],
                  ['Status', lookupBooking.status.replace('_',' ')],
                  ['PIN Verified', lookupBooking.pinVerified ? 'Yes ✓' : 'No'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, textTransform: label === 'Status' ? 'capitalize' : 'none' }}>{val}</span>
                  </div>
                ))}
              </div>

              {['pending','confirmed'].includes(lookupBooking.status) && !lookupBooking.pinVerified && (
                <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--gold)' }}>
                  💡 This booking is not yet verified. Click <strong>Verify & Start</strong> to start the session immediately.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setLookupBooking(null)} className="btn btn-outline">Close</button>
              {['pending','confirmed'].includes(lookupBooking.status) && !lookupBooking.pinVerified && (
                <button onClick={async () => {
                  try {
                    const res = await api.post('/bookings/verify-pin', { bookingId: lookupBooking._id, pin: lookupBooking.pin });
                    toast.success(res.data.message || 'PIN verified! Session started ✂️');
                    setLookupBooking(null);
                    fetch();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Verification failed');
                  }
                }} className="btn btn-gold">
                  <CheckCircle size={16} /> Verify & Start
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
