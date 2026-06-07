import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Scissors, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} color="#0a0a0a" />
                </div>
              )}
              <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20 }}>
                {settings?.salonName || 'SalonPro'}
              </span>
            </Link>
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: 8 }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
            Or <Link to="/book-guest" style={{ color: 'var(--gold)', fontWeight: 500 }}>book without an account →</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 chars" required style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input type="password" className="form-input" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" required />
              </div>
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: 14, fontSize: 16, borderRadius: 10, marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <div style={{
        flex: 1,
        background: settings?.coverImage 
          ? `linear-gradient(rgba(10, 10, 10, 0.65), rgba(10, 10, 10, 0.75)), url(${settings.coverImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--surface), var(--bg-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }} className="hide-mobile">
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 100, marginBottom: 24 }}>💇</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 38, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 12 }}>Your Style Journey Begins</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 300, lineHeight: 1.7 }}>{settings?.tagline || 'Create an account to save your booking history, get reminders and exclusive member offers.'}</p>
        </div>
      </div>
      <style>{`@media(max-width:768px){.hide-mobile{display:none!important}}`}</style>
    </div>
  );
}
