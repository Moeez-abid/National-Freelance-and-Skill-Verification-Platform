import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/badges/me')
      .then(res => setBadges(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBadges([])) // Set to empty array on error
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  const categories = ['Skill', 'Gamification', 'Social Impact'];

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center space-y-2 relative">
        <p className="section-label">Professional Achievements</p>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Your Badge Collection</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">Showcasing your skills, contributions, and milestones within the Nexus ecosystem.</p>
        <button 
          onClick={() => {
            const token = localStorage.getItem('token');
            if (token) {
              window.location.href = `http://localhost:5173/auth/callback?token=${token}`;
            } else {
              window.location.href = 'http://localhost:5173/';
            }
          }}
          className="btn-primary items-center gap-2"
        >
          Verify Badge
        </button>
      </div>

      {categories.map(cat => {
        const catBadges = (Array.isArray(badges) ? badges : []).filter(b => b.category === cat) || [];
        if (catBadges.length === 0 && cat !== 'Skill') return null; // Always show skill section even if empty

        return (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 shrink-0">{cat} Awards</h3>
              <div className="h-px bg-slate-100 dark:bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catBadges.map((badge, i) => (
                <div key={i} className="card p-6 flex items-center gap-5 hover:border-accent/30 group transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {badge.badge_icon_url ? (
                      <img src={badge.badge_icon_url} className="w-10 h-10 object-contain" alt="" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-accent">award_star</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{badge.badge_name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{badge.badge_description}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-accent mt-2">Earned {new Date(badge.awarded_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {catBadges.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-300 dark:text-white/5">
                  <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">No {cat} badges earned yet</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="card p-8 bg-accent/5 dark:bg-accent/[0.03] border-accent/20 text-center">
        <span className="material-symbols-outlined text-3xl text-accent mb-2">info</span>
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">About Skill Badges</p>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2">Skill badges are automatically issued by the platform when you complete specific assessments or reach milestones in your project delivery. We do not manually award these badges.</p>
      </div>
    </div>
  );
}
