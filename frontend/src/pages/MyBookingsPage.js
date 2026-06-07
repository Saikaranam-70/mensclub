import React, { useState, useEffect, useCallback } from 'react';
import { bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Scissors, Star, X, RefreshCw } from 'lucide-react';

const STATUS_BADGE = { pending: 'badge-gold', confirmed: 'badge-green', completed: 'badge-blue', cancelled: 'badge-red', in_progress: 'badge-gold', no_show: 'badge-red' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState({ rating: 5, review: '' });
  const [cancelModal, setCancelModal] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMyBookings({ status: statusFilter || undefined });
      setBookings(res.data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async (id) => {
    try {
      await bookingsAPI.updateStatus(id, { status: 'cancelled', cancelReason: cancelModal.reason || 'Cancelled by user' });
      toast.success('Booking cancelled');
      setCancelModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const handleReview = async () => {
    try {
      await bookingsAPI.addReview(reviewModal._id, review);
      toast.success('Review submitted! 🌟');
      setReviewModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700 }}>My Bookings</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Track all your appointments</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-gold' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <Scissors size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>No bookings found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Ready to look your best?</p>
            <a href="/book" className="btn btn-gold">Book Now</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => (
              <div key={b._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Service image / icon */}
                <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {b.service?.image ? <img src={b.service.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Scissors size={28} color="var(--gold)" />}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontFamily: 'Playfair Display', fontWeight: 600 }}>{b.service?.name}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>with {b.barber?.user?.name} · {b.bookingId}</div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{b.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                      <Calendar size={14} /> {new Date(b.date).toDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                      <Clock size={14} /> {b.startTime} – {b.endTime}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 15 }}>₹{b.price}</div>
                  </div>

                  {/* PIN display */}
                  {['pending', 'confirmed'].includes(b.status) && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 8, padding: '6px 14px', fontSize: 14, marginBottom: 12 }}>
                      🔐 Your PIN: <strong style={{ letterSpacing: '0.15em', fontSize: 16, color: 'var(--gold)' }}>{b.pin}</strong>
                    </div>
                  )}

                  {/* Rating display */}
                  {b.rating && (
                    <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= b.rating ? 'var(--gold)' : 'transparent'} color="var(--gold)" />)}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['pending','confirmed'].includes(b.status) && (
                      <button onClick={() => setCancelModal({ id: b._id, reason: '' })} className="btn btn-danger btn-sm">
                        <X size={14} /> Cancel
                      </button>
                    )}
                    {b.status === 'completed' && !b.rating && (
                      <button onClick={() => { setReviewModal(b); setReview({ rating: 5, review: '' }); }} className="btn btn-outline btn-sm">
                        <Star size={14} /> Leave Review
                      </button>
                    )}
                    {b.status === 'cancelled' && (
                      <a href="/book" className="btn btn-gold btn-sm"><RefreshCw size={14} /> Rebook</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button onClick={() => setCancelModal(null)} className="btn btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Are you sure? This cannot be undone.</p>
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea className="form-input" rows={3} value={cancelModal.reason}
                  onChange={e => setCancelModal({ ...cancelModal, reason: e.target.value })} placeholder="Why are you cancelling?" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setCancelModal(null)} className="btn btn-outline">Keep Booking</button>
              <button onClick={() => handleCancel(cancelModal.id)} className="btn btn-danger">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate Your Experience</h3>
              <button onClick={() => setReviewModal(null)} className="btn btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>How was your {reviewModal.service?.name} with {reviewModal.barber?.user?.name}?</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setReview({ ...review, rating: i })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Star size={36} fill={i <= review.rating ? 'var(--gold)' : 'transparent'} color="var(--gold)" />
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea className="form-input" rows={4} value={review.review}
                  onChange={e => setReview({ ...review, review: e.target.value })} placeholder="Share your experience…" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setReviewModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleReview} className="btn btn-gold">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
