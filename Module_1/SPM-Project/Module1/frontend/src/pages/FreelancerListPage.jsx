import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FreelancerListPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFreelancers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchFreelancers = async (query = '') => {
    try {
      const url = `/users/search/all?role=freelancer${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const res = await api.get(url);
      setFreelancers(res.data.users);
    } catch (err) {
      addToast('Failed to load freelancers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = freelancers; // Backend handles filtering now

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Find Top Talent</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Connect with verified professionals globally</p>
        </div>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name, skill, or headline..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.length > 0 ? (
          filteredFreelancers.map((f) => (
            <div key={f.id} className="card group hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={f.profile_image_url ? `${BASE_URL}${f.profile_image_url}` : `https://i.pravatar.cc/150?u=${f.id}`} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-white/5"
                      alt="" 
                    />
                    {f.is_identity_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                        <span className="material-symbols-outlined text-white text-[14px] font-bold">verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                      {f.first_name} {f.last_name}
                    </h3>
                    <p className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest mb-2 line-clamp-1">
                      {f.headline || 'Professional Freelancer'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                        <span className="text-[11px] font-black">{f.average_rating || '5.0'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">({f.total_reviews || 0} Reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hourly Rate</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Rs. {f.hourly_rate ? parseInt(f.hourly_rate).toLocaleString() : '1,500'}/hr</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trust Score</p>
                    <p className="text-sm font-black text-emerald-500">{f.trust_score || 85}%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex gap-2">
                <Link to={`/profile/${f.id}`} className="flex-1 btn-secondary py-2 text-[10px] text-center">
                  View Profile
                </Link>
                <button 
                  onClick={() => addToast('Hiring module under implementation', 'info')}
                  className="flex-1 btn-primary py-2 text-[10px]"
                >
                  Hire Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-white/5 mb-4">person_search</span>
            <p className="text-slate-500 font-bold">No freelancers found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
