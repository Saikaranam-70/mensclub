import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Clock, DollarSign } from 'lucide-react';

const CATS = ['haircut','beard','hair_treatment','styling','coloring','combo','other'];
const EMPTY = { name:'', description:'', category:'haircut', price:'', duration:'', bufferTime:'5', isPopular:false, isActive:true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    servicesAPI.getAll({ active: 'all' }).then(r => setServices(r.data.services || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY); setImageFile(null); setEditId(null); setModal('form'); };
  const openEdit = (s) => { setForm({ name:s.name, description:s.description||'', category:s.category, price:s.price, duration:s.duration, bufferTime:s.bufferTime||5, isPopular:s.isPopular, isActive:s.isActive }); setImageFile(null); setEditId(s._id); setModal('form'); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) return toast.error('Name, price and duration required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editId) await servicesAPI.update(editId, fd);
      else        await servicesAPI.create(fd);
      toast.success(editId ? 'Service updated' : 'Service created');
      setModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await servicesAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const CAT_ICONS = { haircut:'✂️', beard:'🪒', styling:'💇', coloring:'🎨', hair_treatment:'💆', combo:'⭐', other:'✨' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Services</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4 }}>{services.length} services</p>
        </div>
        <button onClick={openCreate} className="btn btn-gold"><Plus size={16}/> Add Service</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
      ) : (
        <div className="grid-3">
          {services.map(s => (
            <div key={s._id} className="card card-gold" style={{ overflow:'hidden', opacity: s.isActive ? 1 : 0.5 }}>
              <div style={{ height:130, background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, position:'relative' }}>
                {s.image ? <img src={s.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : CAT_ICONS[s.category]}
                {!s.isActive && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:600, fontSize:14 }}>INACTIVE</div>}
                {s.isPopular && <span className="badge badge-gold" style={{ position:'absolute', top:10, left:10 }}>⭐ Popular</span>}
              </div>
              <div className="card-body">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <h3 style={{ fontSize:17, fontFamily:'Playfair Display', fontWeight:600 }}>{s.name}</h3>
                  <span className="badge badge-gray" style={{ textTransform:'capitalize', fontSize:10 }}>{s.category}</span>
                </div>
                <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:16, minHeight:38, lineHeight:1.5 }}>{s.description}</p>
                <div style={{ display:'flex', gap:16, marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--gold)', fontWeight:700 }}><DollarSign size={14}/>₹{s.price}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-muted)', fontSize:13 }}><Clock size={13}/>{s.duration} min</div>
                  <div style={{ color:'var(--text-muted)', fontSize:12 }}>+{s.bufferTime||5}m buffer</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => openEdit(s)} className="btn btn-outline btn-sm" style={{ flex:1 }}><Pencil size={13}/> Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ padding:6 }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Classic Haircut"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input form-select" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {CATS.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="What does this service include?"/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="e.g. 250" min="0"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (mins) *</label>
                  <input type="number" className="form-input" value={form.duration} onChange={e => setForm({...form, duration:e.target.value})} placeholder="e.g. 30" min="5"/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Buffer Time (mins)</label>
                  <input type="number" className="form-input" value={form.bufferTime} onChange={e => setForm({...form, bufferTime:e.target.value})} placeholder="5" min="0"/>
                  <span className="form-error" style={{ color:'var(--text-muted)' }}>Gap between slots after this service</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Image</label>
                  <input type="file" accept="image/*" className="form-input" onChange={e => setImageFile(e.target.files[0])} style={{ padding:'8px' }}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:20 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14 }}>
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm({...form, isPopular:e.target.checked})}/>
                  Mark as Popular
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})}/>
                  Active
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-gold" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create Service'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
