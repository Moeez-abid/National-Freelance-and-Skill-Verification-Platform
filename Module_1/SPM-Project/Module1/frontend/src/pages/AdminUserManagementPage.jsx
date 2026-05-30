import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUS_COLOR = {
  active:    'bg-emerald-500/10 text-emerald-500',
  suspended: 'bg-amber-500/10 text-amber-500',
  banned:    'bg-red-500/10 text-red-500',
};

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  // Moderation modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/users/search/all'
        : `/users/search/all?role=${filter}`;
      const res = await api.get(url);
      setUsers(res.data.users);
    } catch {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setNewStatus(action === 'ban' ? 'banned' : user.account_status || 'active');
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}/status`, { account_status: newStatus });
      addToast(`User status updated to "${newStatus}" ✅`, 'success');
      setShowModal(false);
      fetchUsers();
    } catch {
      addToast('Failed to update user status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = (u) => u.account_status || 'active';

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            User Management
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Control and moderate platform participants
          </p>
        </div>
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
          {['all', 'freelancer', 'client', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => { setFilter(r); setLoading(true); }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                filter === r
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
              <tr>
                {['User', 'Role', 'Country', 'Identity', 'Account Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm font-bold">
                    No users found
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profile_image_url
                          ? `${BASE_URL}${u.profile_image_url}`
                          : `https://i.pravatar.cc/100?u=${u.id}`}
                        className="w-10 h-10 rounded-xl object-cover"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      u.role === 'admin'      ? 'bg-amber-500/10 text-amber-500' :
                      u.role === 'client'     ? 'bg-primary/10 text-primary' :
                                                'bg-blue-500/10 text-blue-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{u.country || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.is_identity_verified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {u.is_identity_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_COLOR[currentStatus(u)] || STATUS_COLOR.active}`}>
                      {currentStatus(u)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(u, 'edit')}
                        title="Change Status"
                        className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => openModal(u, 'ban')}
                        title="Ban User"
                        disabled={currentStatus(u) === 'banned'}
                        className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-lg">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Moderate User
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedUser.first_name} {selectedUser.last_name} — {selectedUser.email}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block ${STATUS_COLOR[currentStatus(selectedUser)] || STATUS_COLOR.active}`}>
                {currentStatus(selectedUser)}
              </span>
            </div>

            <div>
              <label className="section-label mb-2 block">New Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="input-field w-full"
              >
                <option value="active">Active — Full platform access</option>
                <option value="suspended">Suspended — Temporary restriction</option>
                <option value="banned">Banned — Permanent removal</option>
              </select>
            </div>

            {newStatus === 'banned' && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">warning</span>
                <p className="text-[10px] font-bold text-red-500">
                  Banning is a permanent action. The user will lose all platform access.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || newStatus === currentStatus(selectedUser)}
                className={`flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 ${
                  newStatus === 'banned'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'btn-primary'
                }`}
              >
                {submitting ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
