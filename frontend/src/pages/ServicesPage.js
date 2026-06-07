import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import { Clock, ArrowRight, Search } from 'lucide-react';

const CAT_ICONS = { haircut:'✂️', beard:'🪒', styling:'💇', coloring:'🎨', hair_treatment:'💆', combo:'⭐', other:'✨' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    servicesAPI.getAll().then(r => setServices(r.data.services || [])).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filtered = services.filter(s => {
    const matchCat = filter === 'all' || s.category === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="divider divider-center" />
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, marginBottom: 12 }}>
            Our <span style={{ color: 'var(--gold)' }}>Services</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 32 }}>Premium grooming tailored to you</p>
          <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services…" style={{ paddingLeft: 40 }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`btn btn-sm ${filter === cat ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>
              {CAT_ICONS[cat] || ''} {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>No services found.</div>
        ) : (
          <div className="grid-3">
            {filtered.map(s => (
              <div key={s._id} className="card card-gold" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: 160, background: 'linear-gradient(135deg,var(--surface),var(--bg-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative', overflow: 'hidden' }}>
                  {s.image ? <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CAT_ICONS[s.category]}
                  {s.isPopular && <span className="badge badge-gold" style={{ position: 'absolute', top: 12, right: 12 }}>Popular</span>}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 19, fontFamily: 'Playfair Display', fontWeight: 600 }}>{s.name}</h3>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize', flexShrink: 0, marginLeft: 8 }}>{s.category}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20, minHeight: 42 }}>{s.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>₹{s.price}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                        <Clock size={12} /> {s.duration} min
                      </div>
                    </div>
                    <Link to="/book-guest" className="btn btn-gold btn-sm">Book <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA banner */}
        <div style={{ marginTop: 60, background: 'linear-gradient(135deg,var(--surface),var(--bg-secondary))', border: '1px solid var(--gold-border)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 700, marginBottom: 12 }}>
            Can't decide? <span style={{ color: 'var(--gold)' }}>Talk to us!</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Our stylists will recommend the perfect service for you during your visit.</p>
          <Link to="/book-guest" className="btn btn-gold btn-lg">Book a Consultation <ArrowRight size={18} /></Link>
        </div>
      </div>
    </div>
  );
}
