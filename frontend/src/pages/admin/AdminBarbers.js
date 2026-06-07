import React, { useState, useEffect, useCallback } from 'react';
import { barbersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Star, CheckCircle, XCircle } from 'lucide-react';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const EMPTY_FORM = { name:'', email:'', password:'', phone:'', specializations:'', experience:'', bio:'', isAvailable:true };
const EMPTY_HOURS = Object.fromEntries(DAYS.map(d => [d, { start:'09:00', end:'20:00', off: d==='sunday' }]));

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hours, setHours] = useState(EMPTY_HOURS);
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    barbersAPI.getAllAdmin().then(r => setBarbers(r.data.barbers || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY_FORM); setHours(EMPTY_HOURS); setImageFile(null); setEditId(null); setModal('form'); };
  const openEdit = (b) => {
    setForm({ name:b.user?.name||'', email:b.user?.email||'', password:'', phone:b.user?.phone||'', specializations:(b.specializations||[]).join(', '), experience:b.experience||'', bio:b.bio||'', isAvailable:b.isAvailable });
    setHours(b.workingHours || EMPTY_HOURS);
    setImageFile(null); setEditId(b._id); setModal('form');
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    if (!editId && !form.password) return toast.error('Password required for new barber');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      fd.append('workingHours', JSON.stringify(hours));
      fd.set('specializations', JSON.stringify(form.specializations.split(',').map(s=>s.trim()).filter(Boolean)));
      if (imageFile) fd.append('profileImage', imageFile);
      if (editId) await barbersAPI.update(editId, fd);
      else        await barbersAPI.create(fd);
      toast.success(editId ? 'Barber updated' : 'Barber added');
      setModal(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this barber?')) return;
    try { await barbersAPI.delete(id); toast.success('Barber deactivated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Barbers</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4 }}>{barbers.length} team members</p>
        </div>
        <button onClick={openCreate} className="btn btn-gold"><Plus size={16}/> Add Barber</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Barber</th><th>Contact</th><th>Specializations</th><th>Experience</th><th>Rating</th><th>Earnings</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {barbers.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--gold-light))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0a0a0a', overflow:'hidden', flexShrink:0 }}>
                        {b.profileImage ? <img src={b.profileImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : b.user?.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{b.user?.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>#{b._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize:13 }}>{b.user?.email}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{b.user?.phone}</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(b.specializations||[]).slice(0,3).map(sp => <span key={sp} className="badge badge-gray" style={{ fontSize:10 }}>{sp}</span>)}
                    </div>
                  </td>
                  <td style={{ fontSize:14 }}>{b.experience} yrs</td>
                  <td>
                    {b.rating > 0 ? (
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Star size={13} fill="var(--gold)" color="var(--gold)"/>
                        <span style={{ fontSize:14 }}>{b.rating.toFixed(1)}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>({b.totalReviews})</span>
                      </div>
                    ) : <span style={{ color:'var(--text-muted)', fontSize:12 }}>No ratings</span>}
                  </td>
                  <td style={{ fontWeight:600, color:'var(--gold)' }}>₹{(b.totalEarnings||0).toLocaleString()}</td>
                  <td>
                    {b.isAvailable && b.user?.isActive
                      ? <span className="badge badge-green"><CheckCircle size={11}/> Active</span>
                      : <span className="badge badge-red"><XCircle size={11}/> Inactive</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(b)} className="btn btn-outline btn-sm"><Pencil size={13}/></button>
                      <button onClick={() => handleDelete(b._id)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {barbers.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No barbers yet. Add your first team member!</div>}
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Barber' : 'Add New Barber'}</h3>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ padding:6 }}><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight:'70vh', overflowY:'auto' }}>
              <h4 style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.05em' }}>Personal Info</h4>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="John Doe"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="barber@salon.com" disabled={!!editId}/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+91 98765 43210"/>
                </div>
                {!editId && (
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Min 6 chars"/>
                  </div>
                )}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" className="form-input" value={form.experience} onChange={e => setForm({...form, experience:e.target.value})} placeholder="0" min="0"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Photo</label>
                  <input type="file" accept="image/*" className="form-input" onChange={e => setImageFile(e.target.files[0])} style={{ padding:'8px' }}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Specializations (comma-separated)</label>
                <input className="form-input" value={form.specializations} onChange={e => setForm({...form, specializations:e.target.value})} placeholder="Fade, Beard, Coloring"/>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={2} value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} placeholder="Short bio…"/>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, marginBottom:24 }}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({...form, isAvailable:e.target.checked})}/>
                Available for bookings
              </label>

              <h4 style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.05em' }}>Working Hours</h4>
              {DAYS.map(day => (
                <div key={day} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                  <span style={{ width:90, fontSize:13, fontWeight:500, textTransform:'capitalize' }}>{day}</span>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                    <input type="checkbox" checked={hours[day]?.off||false} onChange={e => setHours({...hours, [day]:{...hours[day], off:e.target.checked}})}/>
                    Day off
                  </label>
                  {!hours[day]?.off && (
                    <>
                      <input type="time" className="form-input" value={hours[day]?.start||'09:00'} onChange={e => setHours({...hours, [day]:{...hours[day], start:e.target.value}})} style={{ width:120, padding:'6px 10px', fontSize:13 }}/>
                      <span style={{ color:'var(--text-muted)', fontSize:13 }}>to</span>
                      <input type="time" className="form-input" value={hours[day]?.end||'20:00'} onChange={e => setHours({...hours, [day]:{...hours[day], end:e.target.value}})} style={{ width:120, padding:'6px 10px', fontSize:13 }}/>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-gold" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add Barber'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
