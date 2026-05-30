import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { BASE_URL } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const { addToast } = useToast();

  useEffect(() => {
    profileService.getPublicProfile(userId)
      .then(res => setData(res.data.profile))
      .catch(() => addToast('User not found', 'error'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="text-center py-20"><h2 className="text-2xl font-bold">User Not Found</h2></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header Card */}
      <div className="card overflow-hidden">
        <div className="h-64 bg-slate-200 dark:bg-white/5">
          {data.banner_image_url && <img src={data.banner_image_url.startsWith('http') ? data.banner_image_url : `${BASE_URL}${data.banner_image_url}`} className="w-full h-full object-cover" alt="banner" />}
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex items-end gap-6">
            <div className="w-40 h-40 rounded-2xl border-8 border-white dark:border-surface-container-dark bg-slate-100 overflow-hidden shadow-2xl">
              <img src={data.profile_image_url ? (data.profile_image_url.startsWith('http') ? data.profile_image_url : `${BASE_URL}${data.profile_image_url}`) : `https://ui-avatars.com/api/?name=${data.first_name}+${data.last_name}&size=256`} className="w-full h-full object-cover" alt="avatar" />
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                  {data.first_name} {data.last_name}
                </h1>
                {data.is_identity_verified && (
                  <span className="material-symbols-outlined text-accent fill-accent text-2xl" title="Verified Professional">verified</span>
                )}
              </div>
              <p className="text-lg font-bold text-slate-500 dark:text-accent/80 uppercase tracking-wide mt-1">{data.headline || 'Talented Professional'}</p>
              <div className="flex items-center gap-6 mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {data.location || 'Remote'}</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">payments</span> Rs. {data.hourly_rate || '0'}/hr</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span> {data.average_rating || '0'} Rating</div>
              </div>
            </div>
            <div className="pb-4">
              <button onClick={() => navigate('/post-job')} className="btn-primary px-10 py-4">Hire Professional</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 border-t border-slate-100 dark:border-white/5 pt-8">
            <div className="md:col-span-2">
              <p className="section-label">Professional Philosophy</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">{data.bio || 'No biography provided.'}</p>
            </div>
            <div className="space-y-4">
              <p className="section-label">Engagement Stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-center border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trust Score</p>
                  <p className="text-xl font-black text-primary dark:text-accent">{data.trust_score}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-center border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projects</p>
                  <p className="text-xl font-black text-primary dark:text-accent">{data.portfolio?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto pb-px">
          {['portfolio', 'skills', 'experience', 'certifications', 'reviews'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative
                ${activeTab === tab ? 'text-primary dark:text-accent' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
              `}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in py-4">
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.portfolio?.length > 0 ? data.portfolio.map((project, i) => (
                <div key={i} className="card group cursor-pointer">
                  <div className="h-48 bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <img src={project.featured_image ? (project.featured_image.startsWith('http') ? project.featured_image : `http://localhost:5001${project.featured_image}`) : 'https://via.placeholder.com/600x400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold uppercase tracking-tight">{project.title}</h4>
                      {project.is_featured && <span className="material-symbols-outlined text-amber-400 text-sm">grade</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map(tech => (
                        <span key={tech} className="badge-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )) : <div className="md:col-span-2 py-12 text-center text-slate-400 uppercase font-black tracking-widest text-xs">No projects listed yet</div>}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.skills?.length > 0 ? data.skills.map((skill, i) => (
                <div key={i} className="card p-5 flex items-center justify-between group hover:border-accent/30 transition-all">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{skill.skill_name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{skill.skill_level} • {skill.years_of_experience} Yrs</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skill.is_certified ? 'bg-accent/10 text-accent' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-xl">{skill.is_certified ? 'workspace_premium' : 'psychology'}</span>
                  </div>
                </div>
              )) : <div className="md:col-span-3 py-12 text-center text-slate-400 uppercase font-black tracking-widest text-xs">No skills listed yet</div>}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6 max-w-3xl">
              {data.workHistory?.length > 0 ? data.workHistory.map((work, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {work.company_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 w-px bg-slate-200 dark:bg-white/10 my-2 group-last:hidden"></div>
                  </div>
                  <div className="pb-10">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{work.job_title}</h4>
                      {work.is_current && <span className="badge-tag bg-accent/20 text-accent border-none">Current</span>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{work.company_name} • {new Date(work.start_date).getFullYear()} — {work.is_current ? 'Present' : new Date(work.end_date).getFullYear()}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{work.description}</p>
                  </div>
                </div>
              )) : <div className="py-12 text-center text-slate-400 uppercase font-black tracking-widest text-xs">No work history provided</div>}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="card p-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Verified Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.certifications?.length > 0 ? data.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-accent/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-accent">
                      <span className="material-symbols-outlined text-2xl">verified</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{cert.certification_name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cert.issuing_authority}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic col-span-full">No verified credentials listed yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {data.reviews?.length > 0 ? data.reviews.map((review, i) => (
                <div key={i} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1 text-accent">
                      {[...Array(5)].map((_, star) => (
                        <span key={star} className={`material-symbols-outlined text-lg ${star < review.rating ? 'fill-current' : ''}`}>star</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">"{review.comment}"</p>
                  <div className="flex gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                    {['Communication', 'Quality', 'Deadline'].map(label => (
                      <div key={label}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, s) => (
                            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s < (review[`${label.toLowerCase()}_rating`] || 5) ? 'bg-accent' : 'bg-slate-200 dark:bg-white/10'}`}></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-12 text-center text-slate-400 uppercase font-black tracking-widest text-xs">No reviews yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
