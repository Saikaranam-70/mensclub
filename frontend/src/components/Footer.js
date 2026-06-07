import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings()
      .then(r => setSettings(r.data.settings))
      .catch(() => {});
  }, []);

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div className="container" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} color="#0a0a0a"/>
                </div>
              )}
              <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20 }}>
                {settings?.salonName || "MEN'S CLUB"}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 280 }}>
              {settings?.tagline || 'Premium Barbering & Grooming Studio'} Where style meets precision.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: Instagram, url: settings?.socialMedia?.instagram || 'https://instagram.com' },
                { icon: Facebook, url: settings?.socialMedia?.facebook || 'https://facebook.com' },
                { icon: Twitter, url: settings?.socialMedia?.twitter || 'https://twitter.com' }
              ].map(({ icon: Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <Icon size={16}/>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'Playfair Display', fontWeight: 600, marginBottom: 20, fontSize: 17 }}>Quick Links</h4>
            {[['/', 'Home'], ['/services', 'Services'], ['/barbers', 'Our Team'], ['/gallery', 'Gallery'], ['/register', 'Book Appointment']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>{label}</Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: 'Playfair Display', fontWeight: 600, marginBottom: 20, fontSize: 17 }}>Services</h4>
            {['Classic Haircut', 'Beard Trim & Shape', 'Hair Coloring', 'Scalp Treatment', 'Hot Towel Shave', 'Combo Packages'].map(s => (
              <div key={s} style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10 }}>{s}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Playfair Display', fontWeight: 600, marginBottom: 20, fontSize: 17 }}>Contact</h4>
            {[
              [MapPin, settings?.address || 'Anand Nagar, Pothinamallayya Palem, Potinamallayyapalem, Andhra Pradesh 530041'],
              [Phone, settings?.phone || '091105 78818'],
              [Mail, settings?.email || 'hello@mensclubbarbershop.com'],
              [Clock, settings?.openingHours ? `Mon–Sat: ${settings.openingHours.monday?.open || '9 AM'} – ${settings.openingHours.monday?.close || '8 PM'}, Sun: ${settings.openingHours.sunday?.closed ? 'Closed' : `${settings.openingHours.sunday?.open || '10 AM'} – ${settings.openingHours.sunday?.close || '2 PM'}`}` : 'Mon–Sat: 9 AM – 8 PM, Sun: 10 AM – 2 PM'],
            ].map(([Icon, text], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, color: 'var(--text-secondary)', fontSize: 14 }}>
                <Icon size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--gold)' }}/>
                {i === 0 ? (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                     onMouseLeave={e => e.target.style.color = 'inherit'}>
                    {text}
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 Men's Club Barber Shop. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(t => (
              <a key={t} href="#" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
