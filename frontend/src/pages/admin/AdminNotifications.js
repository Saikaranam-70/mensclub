import React, { useState } from 'react';
import { notificationsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Bell, Tag, MessageSquare } from 'lucide-react';

const TYPE_OPTS = ['promo','system','booking_reminder'];

export default function AdminNotifications() {
  const [form, setForm] = useState({ title:'', message:'', type:'promo' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  const handleBroadcast = async () => {
    if (!form.title || !form.message) return toast.error('Title and message required');
    setSending(true);
    try {
      const res = await notificationsAPI.broadcast(form);
      toast.success(res.data.message);
      setSent(res.data.message);
      setForm({ title:'', message:'', type:'promo' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const TEMPLATES = [
    { label:'Promo Offer', title:'🎁 Special Offer This Weekend!', message:'Get 20% off on all services this weekend. Book now before slots fill up!', type:'promo' },
    { label:'New Service', title:'✨ New Service Added!', message:'We\'ve added an exciting new grooming service to our menu. Check it out and book your slot!', type:'system' },
    { label:'Holiday Notice', title:'🏖️ Holiday Schedule', message:'We will be operating on special hours during the upcoming holiday. Book in advance to secure your slot.', type:'system' },
    { label:'Reminder', title:'⏰ Don\'t Forget Your Appointment!', message:'Just a friendly reminder to check your upcoming appointments on the app.', type:'booking_reminder' },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Broadcast Notifications</h1>
        <p style={{ color:'var(--text-secondary)', marginTop:4 }}>Send notifications to all registered users at once</p>
      </div>

      <div className="grid-2" style={{ gap:28 }}>
        {/* Compose */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
          <h3 style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:24 }}>Compose Message</h3>
          <div className="form-group">
            <label className="form-label"><Bell size={14} style={{ marginRight:6 }}/>Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="Notification title…"/>
          </div>
          <div className="form-group">
            <label className="form-label"><MessageSquare size={14} style={{ marginRight:6 }}/>Message</label>
            <textarea className="form-input" rows={5} value={form.message} onChange={e => setForm({...form, message:e.target.value})} placeholder="Write your message to all users…" style={{ resize:'vertical' }}/>
          </div>
          <div className="form-group">
            <label className="form-label"><Tag size={14} style={{ marginRight:6 }}/>Type</label>
            <select className="form-input form-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
              {TYPE_OPTS.map(t => <option key={t} value={t} style={{ textTransform:'capitalize' }}>{t.replace('_',' ')}</option>)}
            </select>
          </div>

          {/* Preview */}
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Preview</div>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'var(--gold-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {form.type==='promo'?'🎁':form.type==='system'?'📢':'⏰'}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{form.title || 'Notification Title'}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:13, marginTop:4, lineHeight:1.5 }}>{form.message || 'Your message will appear here…'}</div>
              </div>
            </div>
          </div>

          <button onClick={handleBroadcast} className="btn btn-gold" style={{ width:'100%' }} disabled={sending}>
            <Send size={16}/> {sending ? 'Sending…' : 'Broadcast to All Users'}
          </button>

          {sent && (
            <div style={{ marginTop:16, background:'rgba(76,175,112,0.1)', border:'1px solid rgba(76,175,112,0.3)', borderRadius:10, padding:14, fontSize:14, color:'var(--green)', textAlign:'center' }}>
              ✅ {sent}
            </div>
          )}
        </div>

        {/* Templates */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
          <h3 style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:24 }}>Quick Templates</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => setForm({ title:t.title, message:t.message, type:t.type })}
                style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:12, padding:16, textAlign:'left', cursor:'pointer', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>{t.label}</div>
                <div style={{ fontWeight:500, fontSize:13, color:'var(--gold)', marginBottom:4 }}>{t.title}</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{t.message}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop:24, background:'var(--gold-dim)', border:'1px solid var(--gold-border)', borderRadius:12, padding:16, fontSize:13, color:'var(--gold)' }}>
            <strong>📡 Real-time Delivery</strong><br/>
            Notifications are delivered instantly via WebSocket to all online users, and stored for offline users to see on next login.
          </div>
        </div>
      </div>
    </div>
  );
}
