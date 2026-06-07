import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../services/api';
import { X } from 'lucide-react';

const CATS = ['all','haircut','beard','styling','coloring','salon','other'];

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    galleryAPI.getAll().then(r => setImages(r.data.images || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? images : images.filter(i => i.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="divider divider-center" />
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, marginBottom: 12 }}>
            Our <span style={{ color: 'var(--gold)' }}>Gallery</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>A glimpse of our finest work</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36, justifyContent: 'center' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`btn btn-sm ${filter === cat ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            No images yet. Check back soon!
          </div>
        ) : (
          <div style={{ columns: '3 280px', gap: 16 }}>
            {filtered.map(img => (
              <div key={img._id} style={{ breakInside: 'avoid', marginBottom: 16, position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', border: '1px solid var(--border)' }}
                onClick={() => setLightbox(img)}>
                <img src={img.imageUrl} alt={img.title || img.category}
                  style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                {img.isFeatured && (
                  <div style={{ position: 'absolute', top: 10, left: 10 }} className="badge badge-gold">Featured</div>
                )}
                {img.title && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '24px 12px 12px', color: '#fff', fontSize: 13 }}>{img.title}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000 }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <img src={lightbox.imageUrl} alt={lightbox.title} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
            {lightbox.title && <div style={{ textAlign: 'center', color: '#fff', marginTop: 12, fontSize: 15 }}>{lightbox.title}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
