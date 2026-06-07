import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Scissors, Sun, Moon, Bell, Menu, X, User, LogOut, Calendar, Home, Grid, BookOpen, Image } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16}/> },
    { to: '/services', label: 'Services', icon: <Grid size={16}/> },
    { to: '/barbers', label: 'Our Team', icon: <Scissors size={16}/> },
    { to: '/gallery', label: 'Gallery', icon: <Image size={16}/> },
  ];

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'var(--nav-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s',
      padding: '0 clamp(12px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', height: 70, gap: 'clamp(12px, 3vw, 32px)' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <div style={{
              width: 36, height: 36, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scissors size={18} color="#0a0a0a"/>
            </div>
          )}
          <span className="nav-logo-text" style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            {settings?.salonName || "MEN'S CLUB"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              style={({ isActive }) => ({
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              })}
            >{link.label}</NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 2vw, 8px)', marginLeft: 'auto' }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '8px', borderRadius: 8 }}>
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" style={{ position: 'relative', padding: 8, color: 'var(--text-secondary)', display: 'flex' }}>
                <Bell size={18}/>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 16, height: 16, borderRadius: 8,
                    background: 'var(--red)', color: 'white',
                    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14,
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0a0a0a', fontWeight: 700, fontSize: 12,
                  }}>{user.name?.[0]?.toUpperCase()}</div>
                  <span className="nav-user-name" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 8, minWidth: 180, boxShadow: 'var(--shadow)',
                    zIndex: 200,
                  }}>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--gold)', fontSize: 14 }}>
                        <Grid size={15}/> Admin Panel
                      </Link>
                    )}
                    {user.role === 'user' && (
                      <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                        <Calendar size={15}/> My Bookings
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                      <User size={15}/> Profile
                    </Link>
                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }}/>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--red)', fontSize: 14, background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
                      <LogOut size={15}/> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Book Now</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-ghost mobile-menu-btn" style={{ padding: 8 }}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: '12px 16px', borderRadius: 8, fontSize: 15, fontWeight: 500,
                color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 10,
              })}>
              {link.icon} {link.label}
            </NavLink>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-gold" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>Book Now</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .nav-user-name { display: none !important; }
          .mobile-menu-btn { padding: 6px !important; }
          .btn-outline, .btn-gold { padding: 6px 12px !important; font-size: 13px !important; }
        }
        @media (max-width: 600px) {
          .nav-logo-text { display: none !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
