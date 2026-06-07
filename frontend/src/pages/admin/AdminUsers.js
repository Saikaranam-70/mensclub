import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const ROLE_BADGE = { user:'badge-blue', barber:'badge-green', admin:'badge-gold' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display', fontSize:28, fontWeight:700 }}>Users</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4 }}>{total} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24, alignItems:'flex-end' }}>
        <div style={{ position:'relative', flex:'1 1 240px' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="form-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…" style={{ paddingLeft:36 }}/>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['','user','barber','admin'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`btn btn-sm ${roleFilter===r?'btn-gold':'btn-outline'}`}
              style={{ textTransform:'capitalize' }}>{r || 'All Roles'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
      ) : (
        <>
          <div className="table-wrap" style={{ marginBottom:20 }}>
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--gold-light))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0a0a0a', fontSize:14, flexShrink:0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight:500, fontSize:14 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize:14, color:'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize:14, color:'var(--text-secondary)' }}>{u.phone || '—'}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]||'badge-gray'}`} style={{ textTransform:'capitalize' }}>{u.role}</span></td>
                    <td style={{ fontSize:13, color:'var(--text-muted)' }}>{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      {u.isActive
                        ? <span className="badge badge-green">Active</span>
                        : <span className="badge badge-red">Inactive</span>}
                    </td>
                    <td>
                      <button onClick={() => toggleActive(u)}
                        className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-gold'}`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive ? <UserX size={14}/> : <UserCheck size={14}/>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No users found.</div>}
          </div>

          {pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${page===p?'btn-gold':'btn-outline'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
