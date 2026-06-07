import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { barbersAPI, reviewsAPI } from '../services/api';
import { Star, ArrowRight, Award } from 'lucide-react';

export default function BarbersPage() {
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    barbersAPI.getAll().then(r => setBarbers(r.data.barbers || [])).finally(() => setLoading(false));
    reviewsAPI.getAll({ limit: 20 }).then(r => setReviews(r.data.reviews || [])).catch(() => {});
  }, []);

  const barberReviews = selected ? reviews.filter(r => r.barber?._id === selected) : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="divider divider-center" />
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, marginBottom: 12 }}>
            Meet Our <span style={{ color: 'var(--gold)' }}>Team</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>Master stylists passionate about the craft</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {barbers.map(b => (
              <div key={b._id} className="card card-gold" style={{ overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => setSelected(selected === b._id ? null : b._id)}>
                {/* Profile header */}
                <div style={{ height: 200, background: 'linear-gradient(135deg,var(--surface),var(--bg-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {b.profileImage ? (
                    <img src={b.profileImage} alt={b.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#0a0a0a' }}>
                      {b.user?.name?.[0]}
                    </div>
                  )}
                  {b.rating >= 4.5 && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }} className="badge badge-gold"><Award size={12} /> Top Rated</div>
                  )}
                </div>
                <div className="card-body">
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{b.user?.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{b.experience} years experience</p>
                  {b.bio && <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{b.bio}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {(b.specializations || []).map(sp => (
                      <span key={sp} className="badge badge-gray" style={{ fontSize: 11 }}>{sp}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.round(b.rating) ? 'var(--gold)' : 'transparent'} color="var(--gold)" />)}
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({b.totalReviews})</span>
                    </div>
                    <Link to="/book-guest" onClick={e => e.stopPropagation()} className="btn btn-gold btn-sm">Book <ArrowRight size={14} /></Link>
                  </div>
                </div>

                {/* Expanded reviews */}
                {selected === b._id && barberReviews.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: 20, background: 'var(--bg-secondary)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Reviews</h4>
                    {barberReviews.slice(0, 3).map(r => (
                      <div key={r._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= r.rating ? 'var(--gold)' : 'transparent'} color="var(--gold)" />)}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 4 }}>"{r.review}"</p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.user?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
