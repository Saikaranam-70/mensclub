import React, { useState, useEffect, useCallback } from 'react';
import { galleryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, Star, X, Image } from 'lucide-react';

const CATS = ['haircut','beard','styling','coloring','salon','other'];

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({ title:'', category:'salon', isFeatured:false });
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    galleryAPI.getAll({ category: filter === 'all' ? undefined : filter }).then(r => setImages(r.data.images || [])).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error('Please select images');
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      fd.append('title', uploadForm.title);
      fd.append('category', uploadForm.category);
      fd.append('isFeatured', uploadForm.isFeatured);
      await galleryAPI.upload(fd);
      toast.success(`${files.length} image(s) uploaded!`);
      setModal(false); setFiles([]); setPreviews([]);
      setUploadForm({ title:'', category:'salon', isFeatured:false });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const toggleFeatured = async (img) => {
    try {
      await galleryAPI.update(img._id, { isFeatured: !img.isFeatured });
      toast.success(img.isFeatured ? 'Removed from featured' : 'Added to featured');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try { await galleryAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Gallery</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4 }}>{images.length} images</p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-gold"><Upload size={16}/> Upload Images</button>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
        {['all', ...CATS].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`btn btn-sm ${filter===cat?'btn-gold':'btn-outline'}`} style={{ textTransform:'capitalize' }}>{cat}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
      ) : images.length === 0 ? (
        <div style={{ textAlign:'center', padding:80, background:'var(--surface)', borderRadius:20, border:'1px solid var(--border)' }}>
          <Image size={48} style={{ color:'var(--text-muted)', margin:'0 auto 16px' }}/>
          <h3 style={{ fontFamily:'Playfair Display', fontSize:22, marginBottom:8 }}>No images yet</h3>
          <button onClick={() => setModal(true)} className="btn btn-gold" style={{ marginTop:12 }}><Upload size={16}/> Upload First Image</button>
        </div>
      ) : (
        <div style={{ columns:'4 180px', gap:12 }}>
          {images.map(img => (
            <div key={img._id} style={{ breakInside:'avoid', marginBottom:12, position:'relative', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', background:'var(--surface)' }}>
              <img src={img.imageUrl} alt={img.title} style={{ width:'100%', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background 0.2s', display:'flex', alignItems:'flex-end' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.55)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0)'}>
                <div style={{ width:'100%', padding:'8px', display:'flex', justifyContent:'space-between', opacity:0, transition:'opacity 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.parentElement.style.background='rgba(0,0,0,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='0'; e.currentTarget.parentElement.style.background='rgba(0,0,0,0)'; }}>
                  <button onClick={() => toggleFeatured(img)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Star size={18} fill={img.isFeatured?'#f5c842':'transparent'} color="#f5c842"/>
                  </button>
                  <button onClick={() => handleDelete(img._id)} style={{ background:'rgba(224,82,82,0.8)', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#fff' }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
              {img.isFeatured && <div style={{ position:'absolute', top:8, left:8 }} className="badge badge-gold" style={{ fontSize:10 }}>⭐ Featured</div>}
              <div style={{ padding:'8px 12px' }}>
                <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'capitalize' }}>{img.category}</div>
                {img.title && <div style={{ fontSize:13, fontWeight:500, marginTop:2 }}>{img.title}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Images</h3>
              <button onClick={() => setModal(false)} className="btn btn-ghost" style={{ padding:6 }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div style={{ border:'2px dashed var(--border)', borderRadius:14, padding:32, textAlign:'center', marginBottom:20, cursor:'pointer', transition:'border-color 0.2s' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='var(--gold)'; }}
                onDragLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                onDrop={e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)); setPreviews(Array.from(e.dataTransfer.files).map(f=>URL.createObjectURL(f))); e.currentTarget.style.borderColor='var(--border)'; }}>
                <Upload size={32} style={{ color:'var(--text-muted)', margin:'0 auto 12px' }}/>
                <p style={{ color:'var(--text-secondary)', marginBottom:12 }}>Drag & drop or click to select</p>
                <label className="btn btn-outline btn-sm" style={{ cursor:'pointer' }}>
                  Browse Files
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display:'none' }}/>
                </label>
              </div>

              {previews.length > 0 && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }}/>
                  ))}
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Title (optional)</label>
                  <input className="form-input" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title:e.target.value})} placeholder="e.g. Fade Cut"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" value={uploadForm.category} onChange={e => setUploadForm({...uploadForm, category:e.target.value})}>
                    {CATS.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14 }}>
                <input type="checkbox" checked={uploadForm.isFeatured} onChange={e => setUploadForm({...uploadForm, isFeatured:e.target.checked})}/>
                Mark as Featured (shown on homepage)
              </label>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleUpload} className="btn btn-gold" disabled={uploading || !files.length}>
                {uploading ? 'Uploading…' : `Upload ${files.length || ''} Image${files.length!==1?'s':''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
