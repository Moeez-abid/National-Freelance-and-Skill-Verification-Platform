import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await profileService.getMyProfile();
        setProfile(profileRes.data);

        // Fetch Stats
        const statsRes = await api.get('/users/me/stats');
        setDashboardStats(statsRes.data.stats);

        // Fetch Recent Reviews
        const reviewsRes = await api.get('/reviews/me/recent');
        setRecentActivities(reviewsRes.data.reviews);

        if (user?.role === 'client') {
          const usersRes = await api.get('/users/search/all?role=freelancer');
          setFreelancers(usersRes.data.users);
        }
        if (user?.role === 'freelancer') {
          const lbRes = await api.get('/leaderboard');
          setLeaderboard(lbRes.data.leaderboard || []);

          // Fetch Certs for status check
          const certsRes = await api.get(`/certifications/${user.id}`);
          setCertifications(certsRes.data.certifications || []);
        }
      } catch (err) {
        addToast('Failed to fetch dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  const role = user?.role || 'freelancer';
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const isFreelancer = role === 'freelancer';

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? 'bg-amber-500' : isClient ? 'bg-emerald-500' : 'bg-accent'}`}></span>
            <p className="section-label mb-0 flex items-center gap-1">
              System Live • 
              <span className={`font-black ${isAdmin ? 'text-amber-500' : isClient ? 'text-emerald-500' : 'text-accent'}`}>
                {role.toUpperCase()}
              </span> 
              Console
            </p>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            {isAdmin ? 'Platform Operations' : isClient ? 'Client Command' : 'Professional Workspace'}
          </h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate(isAdmin ? '/admin/system' : '/reviews')}
            className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 py-2.5 px-4 text-[10px]"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            {isAdmin ? 'System Logs' : 'Detailed Reports'}
          </button>
          {isClient && (
            <button
              onClick={() => navigate('/post-job')}
              className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 py-2.5 px-4 text-[10px]"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Post New Job
            </button>
          )}
        </div>
      </div>

      {/* Primary Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Stat Card (Varies by Role) */}
        <div className="lg:col-span-8 card p-8 bg-slate-900 text-white border-none relative overflow-hidden group shadow-2xl min-h-[320px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1">
                  {isAdmin ? 'System Load' : isClient ? 'Recruitment Funnel' : 'Growth Overview'}
                </p>
                <h3 className="text-2xl font-black tracking-tight uppercase">
                  {isAdmin ? 'Global Network Activity' : isClient ? 'Freelancer Engagement' : 'Portfolio Traction'}
                </h3>
              </div>
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-accent">
                  {isAdmin ? 'hub' : 'trending_up'}
                </span>
              </div>
            </div>

            {/* Visualizer */}
            <div className="h-32 flex items-end gap-2 px-2 mt-8">
              {[35, 65, 40, 85, 55, 75, 45, 95, 65, 80, 50, 90].map((h, i) => (
                <div key={i} className="flex-1 group/bar relative">
                  <div 
                    className="w-full bg-accent/30 group-hover/bar:bg-accent rounded-t-sm transition-all duration-500" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">
              <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Role Specific Side Card */}
          <div className="card p-6 flex flex-col justify-between h-[180px] border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.05]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-xl font-bold">
                    {isAdmin ? 'security' : isClient ? 'payments' : 'auto_graph'}
                  </span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {isAdmin ? 'Stable' : '0%'}
                </span>
              </div>
              <p className="section-label">
                {isAdmin ? 'Security Protocols' : isClient ? 'Total Investment' : 'Total Revenue'}
              </p>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">
                {isAdmin ? 'Level 4' : isClient ? 'Rs. 0' : 'Rs. 0'}
              </h3>
            </div>
          </div>

          <div className="card p-6 bg-slate-900 dark:bg-white/5 text-white border-none group h-[115px] flex flex-col justify-center">
            <p className="section-label text-white/40 mb-2">
              {isAdmin ? 'System Uptime' : 'Network Reach'}
            </p>
            <div className="flex items-center justify-between">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-400">99.98%</span>
                  <div className="flex gap-0.5">
                    {[1,1,1,1,1].map((_, i) => <div key={i} className="w-1 h-4 bg-emerald-500/50 rounded-full"></div>)}
                  </div>
                </div>
              ) : (
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/150?u=${i + (isAdmin ? 20 : 0)}`} alt="" />
                  ))}
                </div>
              )}
              <div className="text-right">
                <h4 className="text-lg font-bold leading-none">{isAdmin ? 'Verified' : isClient ? '0' : '0'}</h4>
                <p className="text-[8px] font-black text-accent uppercase tracking-widest">
                  {isAdmin ? 'Cluster 01' : isClient ? 'Active Bids' : 'Connections'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-20">
        {[
          { 
            label: isAdmin ? 'Total Users' : isClient ? 'Reviews Given' : 'Trust Score', 
            value: isAdmin ? dashboardStats?.total_users : isClient ? dashboardStats?.reviews_given : `${profile?.trust_score || 0}%`, 
            icon: isAdmin ? 'group' : isClient ? 'rate_review' : 'verified', 
            color: 'text-blue-500' 
          },
          { 
            label: isAdmin ? 'Pending Verifications' : isClient ? 'Active Hires' : 'Platform Tier', 
            value: isAdmin ? dashboardStats?.pending_verifications : isClient ? '0' : profile?.tier_level || 'Beginner', 
            icon: isAdmin ? 'rule' : isClient ? 'person_pin' : 'military_tech', 
            color: 'text-amber-500' 
          },
          { 
            label: isAdmin ? 'Reports Today' : isClient ? 'Avg. Rating Given' : 'Total Reviews', 
            value: isAdmin ? '0' : isClient ? `${dashboardStats?.avg_rating_given || '0.0'}/5.0` : profile?.total_reviews || 0, 
            icon: isAdmin ? 'assessment' : isClient ? 'thumb_up' : 'chat_bubble', 
            color: 'text-emerald-500' 
          },
          { 
            label: isAdmin ? 'Active Servers' : isClient ? 'Spent this Month' : 'Avg Rating', 
            value: isAdmin ? 'Up' : isClient ? 'Rs. 0' : `${profile?.average_rating || 0}/5.0`, 
            icon: isAdmin ? 'dns' : isClient ? 'payments' : 'star', 
            color: 'text-accent' 
          },
        ].map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col items-center text-center group hover:border-primary/50 transition-all cursor-default shadow-lg bg-white dark:bg-surface-dark">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="section-label mb-1 text-slate-400">{stat.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value || 0}</p>
            {isAdmin && stat.label === 'Pending Verifications' && (
              <div className="mt-1 flex gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                <span>Identity: {dashboardStats?.pending_identity || 0}</span>
                <span>•</span>
                <span>Certs: {dashboardStats?.pending_certifications || 0}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Verification Status Banner (for Freelancers) */}
      {isFreelancer && certifications.length > 0 && (
        <div className="card p-6 bg-accent/5 border-accent/20 border-dashed animate-fade-in mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-accent font-bold">notification_important</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Verification Updates</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                {certifications.slice(-3).map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{c.certification_name}:</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      c.verification_status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                      c.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {c.verification_status}
                    </span>
                    {c.verification_status === 'rejected' && (
                      <span className="text-[9px] text-rose-400 italic">Reason: {c.rejection_reason || 'See details'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => navigate('/certifications')}
              className="text-[10px] font-black uppercase text-accent hover:underline"
            >
              Manage All
            </button>
          </div>
        </div>
      )}

      {/* Bottom Section: Activity & Talent/Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isAdmin ? 'System Audit Log' : 'Recent Feedback'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isAdmin ? 'Real-time monitoring active' : isClient ? 'Reviews you have submitted' : 'Recent comments from your clients'}
              </p>
            </div>
            <button
              onClick={() => navigate('/reviews')}
              className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-6">
            {recentActivities?.length > 0 ? (
              recentActivities.map((act, i) => (
                <div key={act.id} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                      {isClient ? 'rate_review' : 'chat_bubble'}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {isClient ? `Reviewed ${act.first_name} ${act.last_name}` : `New review from ${act.first_name} ${act.last_name}`}
                      </p>
                      <p className="text-xs text-slate-500 italic line-clamp-1 mt-0.5">"{act.comment}"</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {new Date(act.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[12px] text-amber-500 fill-current">star</span>
                      <span className="text-[10px] font-black text-slate-500">{act.rating}.0</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">history</span>
                <p className="text-sm font-bold text-slate-400">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-8 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
            {isAdmin ? 'Admin Shortcuts' : isClient ? 'Top Matching Talent' : 'Network Highlights'}
          </h3>
          <div className="space-y-4 flex-1">
            {isAdmin ? (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Verify Users',  path: '/admin/reviews' },
                  { label: 'User Management', path: '/admin/users' },
                  { label: 'Moderation',    path: '/admin/reviews' },
                  { label: 'Report Hub',    path: '/admin/system' },
                ].map(({ label, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="flex items-center justify-between min-h-[50px] p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/30 transition-all group"
                  >
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{label}</span>
                    <span className="material-symbols-outlined text-sm text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                ))}
              </div>
            ) : isClient ? (
              // Fetching real freelancers for client
              freelancers?.length > 0 ? (
                freelancers.slice(0, 3).map((f) => (
                  <Link key={f.id} to={`/profile/${f.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                      <img src={f.profile_image_url ? `${BASE_URL}${f.profile_image_url}` : `https://i.pravatar.cc/100?u=talent${f.id}`} alt="" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-none group-hover:text-primary transition-colors">
                        {f.first_name} {f.last_name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {f.trust_score || 85}% Trust • Rs. {f.hourly_rate ? parseInt(f.hourly_rate).toLocaleString() : '1,500'}/hr
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                  <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">person_off</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No Talent Found</p>
                </div>
              )
            ) : (
              // Top peers from leaderboard for freelancer networking
              leaderboard.length > 0 ? (
                leaderboard.slice(0, 3).map((f) => (
                  <Link
                    key={f.id}
                    to={`/profile/${f.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                      <img
                        src={f.profile_image_url
                          ? `${BASE_URL}${f.profile_image_url}`
                          : `https://i.pravatar.cc/100?u=lb${f.id}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-none truncate group-hover:text-primary transition-colors">
                        {f.name || `${f.first_name || ''} ${f.last_name || ''}`.trim()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {f.trust_score || 0}% Trust · ★ {parseFloat(f.average_rating || 0).toFixed(1)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                  <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">people</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Network loading...</p>
                </div>
              )
            )}
          </div>
          <button
            onClick={() => navigate(isAdmin ? '/admin/users' : isClient ? '/freelancers' : '/freelancers')}
            className="mt-6 btn-secondary w-full py-3 text-[10px]"
          >
            {isAdmin ? 'Full System Admin' : isClient ? 'Find More Talent' : 'Explore Network'}
          </button>
        </div>
      </div>
    </div>
  );
}
