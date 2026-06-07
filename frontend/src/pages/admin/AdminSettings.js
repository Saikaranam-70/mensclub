import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Upload, Globe, Clock, Phone, Mail, MapPin } from 'lucide-react';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [heroFiles, setHeroFiles] = useState([]);

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (settings.salonName) fd.append('salonName', settings.salonName);
      if (settings.tagline)   fd.append('tagline',   settings.tagline);
      if (settings.address)   fd.append('address',   settings.address);
      if (settings.mapUrl)    fd.append('mapUrl',    settings.mapUrl);
      if (settings.phone)     fd.append('phone',     settings.phone);
      if (settings.email)     fd.append('email',     settings.email);
      if (settings.about)     fd.append('about',     settings.about);
      fd.append('openingHours',    JSON.stringify(settings.openingHours || {}));
      fd.append('socialMedia',     JSON.stringify(settings.socialMedia  || {}));
      fd.append('bookingSettings', JSON.stringify(settings.bookingSettings || {}));
      if (logoFile)  fd.append('logo',       logoFile);
      if (coverFile) fd.append('coverImage', coverFile);
      heroFiles.forEach(f => fd.append('heroImages', f));
      await adminAPI.updateSettings(fd);
      toast.success('Settings saved!');
      setLogoFile(null); setCoverFile(null); setHeroFiles([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>;
  if (!settings) return null;

  const updateHours = (day, field, value) => setSettings({...settings, openingHours:{...settings.openingHours, [day]:{...settings.openingHours?.[day], [field]:value}}});
  const updateBooking = (field, value) => setSettings({...settings, bookingSettings:{...settings.bookingSettings, [field]:value}});
  const updateSocial  = (field, value) => setSettings({...settings, socialMedia:{...settings.socialMedia, [field]:value}});

  const TABS = [['general','General'], ['hours','Hours'], ['booking','Booking'], ['media','Media & Brand']];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Salon Settings</h1>
        <button onClick={handleSave} className="btn btn-gold" disabled={saving}><Save size={16}/>{saving?'Saving…':'Save Changes'}</button>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:4 }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, padding:'10px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:14, fontWeight:500, background:tab===key?'var(--gold)':'transparent', color:tab===key?'#0a0a0a':'var(--text-secondary)', transition:'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>

        {/* GENERAL */}
        {tab === 'general' && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Salon Name</label>
                <input className="form-input" value={settings.salonName||''} onChange={e => setSettings({...settings, salonName:e.target.value})} placeholder="SalonPro"/>
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input className="form-input" value={settings.tagline||''} onChange={e => setSettings({...settings, tagline:e.target.value})} placeholder="Premium Grooming Experience"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} style={{ marginRight:6 }}/>Address</label>
              <input className="form-input" value={settings.address||''} onChange={e => setSettings({...settings, address:e.target.value})} placeholder="123 Main St, City"/>
            </div>
            <div className="form-group">
              <label className="form-label"><Globe size={14} style={{ marginRight:6 }}/>Google Maps Embed URL</label>
              <input className="form-input" value={settings.mapUrl||''} onChange={e => setSettings({...settings, mapUrl:e.target.value})} placeholder="https://www.google.com/maps/embed?..."/>
              <span style={{ fontSize:12, color:'var(--text-muted)', marginTop:4, display:'block' }}>
                To get this URL: search your address on Google Maps, click <strong>Share</strong>, choose <strong>Embed a map</strong>, and copy the <strong>src</strong> attribute of the iframe.
              </span>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label"><Phone size={14} style={{ marginRight:6 }}/>Phone</label>
                <input className="form-input" value={settings.phone||''} onChange={e => setSettings({...settings, phone:e.target.value})} placeholder="+91 98765 43210"/>
              </div>
              <div className="form-group">
                <label className="form-label"><Mail size={14} style={{ marginRight:6 }}/>Email</label>
                <input className="form-input" value={settings.email||''} onChange={e => setSettings({...settings, email:e.target.value})} placeholder="hello@salon.com"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">About Salon</label>
              <textarea className="form-input" rows={4} value={settings.about||''} onChange={e => setSettings({...settings, about:e.target.value})} placeholder="Describe your salon…" style={{ resize:'vertical' }}/>
            </div>
            <h4 style={{ fontSize:15, fontWeight:600, marginBottom:14, marginTop:8, color:'var(--text-secondary)' }}>Social Media</h4>
            <div className="grid-2">
              {['instagram','facebook','twitter'].map(s => (
                <div key={s} className="form-group">
                  <label className="form-label" style={{ textTransform:'capitalize' }}>{s}</label>
                  <input className="form-input" value={settings.socialMedia?.[s]||''} onChange={e => updateSocial(s, e.target.value)} placeholder={`https://${s}.com/yoursalon`}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOURS */}
        {tab === 'hours' && (
          <div>
            <h3 style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:20 }}>Opening Hours</h3>
            {DAYS.map(day => (
              <div key={day} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14, flexWrap:'wrap', paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
                <span style={{ width:100, fontSize:14, fontWeight:500, textTransform:'capitalize', flexShrink:0 }}>{day}</span>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                  <input type="checkbox" checked={settings.openingHours?.[day]?.closed||false} onChange={e => updateHours(day,'closed',e.target.checked)}/>
                  Closed
                </label>
                {!settings.openingHours?.[day]?.closed && (
                  <>
                    <div className="form-group" style={{ margin:0 }}>
                      <label className="form-label">Open</label>
                      <input type="time" className="form-input" value={settings.openingHours?.[day]?.open||'09:00'} onChange={e => updateHours(day,'open',e.target.value)} style={{ padding:'8px 12px' }}/>
                    </div>
                    <div className="form-group" style={{ margin:0 }}>
                      <label className="form-label">Close</label>
                      <input type="time" className="form-input" value={settings.openingHours?.[day]?.close||'20:00'} onChange={e => updateHours(day,'close',e.target.value)} style={{ padding:'8px 12px' }}/>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOOKING */}
        {tab === 'booking' && (
          <div>
            <h3 style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:20 }}>Booking Rules</h3>
            <div className="grid-2">
              {[
                ['advanceBookingDays','Advance Booking (days)','How many days ahead users can book'],
                ['minAdvanceHours','Min Advance Notice (hours)','Minimum hours before appointment'],
                ['cancellationHours','Cancellation Window (hours)','Hours before appointment to allow cancellation'],
              ].map(([key, label, hint]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input type="number" className="form-input" value={settings.bookingSettings?.[key]||''} onChange={e => updateBooking(key, Number(e.target.value))} min="0"/>
                  <span className="form-error" style={{ color:'var(--text-muted)' }}>{hint}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:8 }}>
              {[
                ['autoConfirm','Auto-confirm bookings (no manual approval needed)'],
                ['allowCancellation','Allow users to cancel their own bookings'],
              ].map(([key, label]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:15 }}>
                  <input type="checkbox" checked={settings.bookingSettings?.[key]||false} onChange={e => updateBooking(key, e.target.checked)}/>
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* MEDIA */}
        {tab === 'media' && (
          <div>
            <h3 style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:20 }}>Brand Assets</h3>
            <div className="grid-2">
              <div>
                <div className="form-group">
                  <label className="form-label"><Upload size={14} style={{ marginRight:6 }}/>Salon Logo</label>
                  {settings.logo && <img src={settings.logo} alt="logo" style={{ width:80, height:80, objectFit:'contain', borderRadius:10, border:'1px solid var(--border)', marginBottom:10 }}/>}
                  <input type="file" accept="image/*" className="form-input" onChange={e => setLogoFile(e.target.files[0])} style={{ padding:'8px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label"><Upload size={14} style={{ marginRight:6 }}/>Cover Image</label>
                  {settings.coverImage && <img src={settings.coverImage} alt="cover" style={{ width:'100%', height:120, objectFit:'cover', borderRadius:10, border:'1px solid var(--border)', marginBottom:10 }}/>}
                  <input type="file" accept="image/*" className="form-input" onChange={e => setCoverFile(e.target.files[0])} style={{ padding:'8px' }}/>
                </div>
              </div>
              <div>
                <div className="form-group">
                  <label className="form-label"><Upload size={14} style={{ marginRight:6 }}/>Hero Images (homepage slideshow)</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                    {(settings.heroImages||[]).map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }}/>
                    ))}
                  </div>
                  <input type="file" accept="image/*" multiple className="form-input" onChange={e => setHeroFiles(Array.from(e.target.files))} style={{ padding:'8px' }}/>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>Select up to 5 images. New images will be added to existing ones.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
