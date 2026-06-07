import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Scissors, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'barber') navigate('/');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} color="#0a0a0a"/>
                </div>
              )}
              <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20 }}>
                {settings?.salonName || 'SalonPro'}
              </span>
            </Link>
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: 8 }}>
              {isDark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>Sign in to manage your bookings and profile.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Your password" required style={{ paddingRight: 44 }}/>
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8, borderRadius: 10 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 500 }}>Create one</Link>
          </p>

          {/* Demo accounts */}
          <div style={{ marginTop: 32, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Accounts</div>
            {[
              ['Admin', 'admin@mensclub.com', 'admin123'],
              ['User', 'user@mensclub.com', 'user1234'],
            ].map(([role, email, pass]) => (
              <button key={role} onClick={() => setForm({ email, password: pass })}
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                <span>{role}</span>
                <span style={{ color: 'var(--text-muted)' }}>{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - decorative */}
      <div style={{
        flex: 1,
        background: settings?.coverImage 
          ? `linear-gradient(rgba(10, 10, 10, 0.65), rgba(10, 10, 10, 0.75)), url(${settings.coverImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--surface) 0%, var(--bg-secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }} className="hide-mobile">
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 120, marginBottom: 24 }}>✂️</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 40, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 16 }}>Look Good, Feel Great</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 320, lineHeight: 1.7 }}>{settings?.tagline || 'Your perfect grooming destination. Premium cuts, expert stylists, seamless booking.'}</p>
        </div>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,175,55,0.1), transparent)', borderRadius: '50%' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent)', borderRadius: '50%' }}/>
      </div>

      <style>{`@media (max-width: 768px) { .hide-mobile { display: none !important; } }`}</style>
    </div>
  );
}
