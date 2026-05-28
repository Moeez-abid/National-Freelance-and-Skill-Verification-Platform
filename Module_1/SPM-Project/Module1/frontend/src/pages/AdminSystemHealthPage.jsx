import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AdminSystemHealthPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, leaderboardRes] = await Promise.all([
          api.get('/users/me/stats'),
          api.get('/users/search/all'),
          api.get('/leaderboard'),
        ]);
        setStats(statsRes.data.stats);
        setAllUsers(usersRes.data.users || []);
        setTopFreelancers((leaderboardRes.data.leaderboard || []).slice(0, 5));
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (user && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  );

  const roleCount = (role) => allUsers.filter(u => u.role === role).length;
  const verifiedCount = allUsers.filter(u => u.is_identity_verified).length;
  const suspendedCount = allUsers.filter(u => u.account_status === 'suspended').length;
  const bannedCount = allUsers.filter(u => u.account_status === 'banned').length;

  const metricCards = [
    { label: 'Total Users', value: stats?.total_users ?? allUsers.length, icon: 'group', color: 'text-blue-500' },
    { label: 'Freelancers', value: roleCount('freelancer'), icon: 'work', color: 'text-emerald-500' },
    { label: 'Clients', value: roleCount('client'), icon: 'business_center', color: 'text-primary' },
    { label: 'Pending Verifications', value: stats?.pending_verifications ?? 0, icon: 'rule', color: 'text-amber-500' },
    { label: 'Verified Users', value: verifiedCount, icon: 'verified_user', color: 'text-emerald-500' },
    { label: 'Suspended', value: suspendedCount, icon: 'pause_circle', color: 'text-orange-500' },
    { label: 'Banned', value: bannedCount, icon: 'block', color: 'text-red-500' },
    { label: 'Admins', value: roleCount('admin'), icon: 'admin_panel_settings', color: 'text-accent' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="section-label mb-0">Platform Control • Admin</p>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            System Health
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Real-time platform metrics and user distribution
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">All Systems Operational</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {metricCards.map((m, i) => (
          <div key={i} className="card p-6 flex flex-col items-center text-center group hover:border-primary/30 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className={`material-symbols-outlined text-2xl ${m.color}`}>{m.icon}</span>
            </div>
            <p className="section-label mb-1 text-slate-400">{m.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution */}
        <div className="lg:col-span-2 card p-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
            User Distribution
          </h3>
          <div className="space-y-4">
            {[
              { role: 'freelancer', label: 'Freelancers', color: 'bg-emerald-500' },
              { role: 'client', label: 'Clients', color: 'bg-primary' },
              { role: 'admin', label: 'Admins', color: 'bg-amber-500' },
            ].map(({ role, label, color }) => {
              const count = roleCount(role);
              const pct = allUsers.length > 0 ? Math.round((count / allUsers.length) * 100) : 0;
              return (
                <div key={role}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Account Status Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active', value: allUsers.filter(u => !u.account_status || u.account_status === 'active').length, color: 'text-emerald-500' },
                { label: 'Suspended', value: suspendedCount, color: 'text-orange-500' },
                { label: 'Banned', value: bannedCount, color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Freelancers */}
        <div className="card p-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
            Top Freelancers
          </h3>
          <div className="space-y-4">
            {topFreelancers.length > 0 ? topFreelancers.map((f, i) => (
              <Link
                key={f.id}
                to={`/profile/${f.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:border hover:border-primary/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                  <img
                    src={f.profile_image_url
                      ? `${BASE_URL}${f.profile_image_url}`
                      : `https://i.pravatar.cc/100?u=fl${f.id}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    #{i + 1} {f.name || `${f.first_name || ''} ${f.last_name || ''}`.trim()}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {f.trust_score || 0}% Trust · ★ {parseFloat(f.average_rating || 0).toFixed(1)}
                  </p>
                </div>
              </Link>
            )) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">person_off</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">No freelancers yet</p>
              </div>
            )}
          </div>
          <Link to="/admin/users" className="mt-6 btn-secondary w-full py-3 text-[10px] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            Manage All Users
          </Link>
        </div>
      </div>
    </div>
  );
}
