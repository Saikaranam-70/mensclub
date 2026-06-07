import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Scissors, LayoutDashboard, Grid, Users, Calendar, Image, Settings,
  Bell, LogOut, Menu, X, Sun, Moon, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/bookings',     label: 'Bookings',      icon: Calendar },
  { to: '/admin/services',     label: 'Services',      icon: Grid },
  { to: '/admin/barbers',      label: 'Barbers',       icon: Scissors },
  { to: '/admin/gallery',      label: 'Gallery',       icon: Image },
  { to: '/admin/users',        label: 'Users',         icon: Users },
  { to: '/admin/notifications',label: 'Notifications', icon: Bell },
  { to: '/admin/settings',     label: 'Settings',      icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', borderRadius: 10, display: 'flex', alignItems: 'center', flexShrink: 0, justifyContent: 'center' }}>
            <Scissors size={18} color="#0a0a0a" />
          </div>
        )}
        {!collapsed && <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>{settings?.salonName || 'SalonPro'} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 400 }}>Admin</span></span>}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setMobileSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              borderRadius: 10, marginBottom: 4, fontSize: 14, fontWeight: 500,
              color: isActive ? '#0a0a0a' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'transparent',
              transition: 'all 0.15s', textDecoration: 'none', position: 'relative',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {!collapsed && label === 'Notifications' && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{unreadCount}</span>
                )}
                {!isActive && !collapsed && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + actions */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, marginBottom: 4 }}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', marginTop: 8, background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0a0a0a', flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div style={{ width: collapsed ? 64 : 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', transition: 'width 0.25s', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }} className="desktop-sidebar">
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', top: 22, right: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, color: 'var(--text-muted)' }}>
          {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
        </button>
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} className="mobile-sidebar-overlay">
          <div style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', height: '100%' }}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }} className="mobile-topbar">
          <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <Menu size={22} />
          </button>
          {settings?.logo && <img src={settings.logo} alt="Logo" style={{ height: 24, width: 24, objectFit: 'cover', borderRadius: '50%' }} />}
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>
            {settings?.salonName || 'SalonPro'} Admin
          </span>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media(min-width:769px){.mobile-topbar{display:none!important}.mobile-sidebar-overlay{display:none!important}}
        @media(max-width:768px){.desktop-sidebar{display:none!important}}
      `}</style>
    </div>
  );
}
