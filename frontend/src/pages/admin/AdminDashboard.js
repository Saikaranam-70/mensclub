import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, Scissors, Calendar, TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--gold)' }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Playfair Display' }}>{value}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

const STATUS_BADGE = { pending:'badge-gold', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red', in_progress:'badge-gold' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bookings');

  useEffect(() => {
    dashboardAPI.getStats().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!data) return null;

  const { stats, recentBookings = [], topServices = [], topBarbers = [], weeklyData = [] } = data;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon={Users}     label="Total Clients"    value={stats.totalUsers}     sub="Active accounts" color="var(--blue)" />
        <StatCard icon={Scissors}  label="Active Barbers"   value={stats.totalBarbers}   sub="On the team" />
        <StatCard icon={Calendar}  label="Today's Bookings" value={stats.todayBookings}  sub="Scheduled today" color="var(--green)" />
        <StatCard icon={DollarSign} label="Total Revenue"   value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} sub="Completed sessions" color="var(--gold)" />
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon={Clock}       label="Pending"        value={stats.pendingBookings}  sub="Awaiting confirmation" color="#f59e0b" />
        <StatCard icon={CheckCircle} label="This Month"     value={stats.monthBookings}    sub="Monthly bookings" color="var(--green)" />
        <StatCard icon={TrendingUp}  label="Total Bookings" value={stats.totalBookings}    sub="All time" color="var(--blue)" />
        <StatCard icon={Scissors}    label="Services"       value={stats.totalServices}    sub="Active menu items" color="var(--gold)" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>Weekly Overview</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['bookings','revenue'].map(t => (
                <button key={t} onClick={() => setChartType(t)} className={`btn btn-sm ${chartType === t ? 'btn-gold' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey={chartType} fill="var(--gold)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 24 }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill: 'var(--gold)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Top Services */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Top Services</h3>
          {topServices.map((s, i) => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-dim)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{s.price}</div>
                </div>
              </div>
              <span className="badge badge-gold">{s.totalBookings} bookings</span>
            </div>
          ))}
        </div>

        {/* Top Barbers */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Top Barbers</h3>
          {topBarbers.map((b, i) => (
            <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-dim)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{b.user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {b.rating?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>₹{b.totalEarnings?.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.completedBookings} done</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Today's Upcoming</h3>
        {recentBookings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No bookings today.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th><th>Service</th><th>Barber</th><th>Time</th><th>Price</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 500 }}>{b.isGuest ? b.guestName + ' 👤' : b.user?.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.service?.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.barber?.user?.name}</td>
                    <td>{b.startTime}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{b.price}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
