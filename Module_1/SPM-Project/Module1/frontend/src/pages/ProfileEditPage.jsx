import React, { useState, useEffect, useRef } from 'react';
import api, { BASE_URL } from '../services/api';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';

export default function ProfileEditPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  
  const avatarRef = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    profileService.getMyProfile()
      .then(res => setProfile(res.data))
      .catch(() => addToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(profile.user_id, profile);
      addToast('Profile updated successfully! ✅', 'success');
    } catch (err) {
      addToast('Failed to update profile ❌', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = type === 'avatar' 
        ? await profileService.uploadAvatar(profile.user_id, file)
        : await profileService.uploadBanner(profile.user_id, file);
      
      setProfile(prev => ({ 
        ...prev, 
        [type === 'avatar' ? 'profile_image_url' : 'banner_image_url']: res.data.url 
      }));
      addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`, 'success');
      // Refresh profile to ensure full sync
      const updated = await profileService.getMyProfile();
      setProfile(updated.data);
    } catch (err) {
      addToast(`Failed to upload ${type}`, 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="section-label">Identity Management</p>
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Profile Settings</h2>
      </div>

      <div className="card overflow-visible">
        {/* Banner Section */}
        <div className="h-48 bg-slate-200 dark:bg-white/5 relative group cursor-pointer" onClick={() => bannerRef.current.click()}>
          {profile?.banner_image_url ? (
            <img src={profile.banner_image_url.startsWith('http') ? profile.banner_image_url : `http://localhost:5001${profile.banner_image_url}`} className="w-full h-full object-cover" alt="banner" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Click to upload banner
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
          </div>
          <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
        </div>

        {/* Profile Info Header */}
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end justify-between">
            <div className="relative group cursor-pointer" onClick={() => avatarRef.current.click()}>
              <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-surface-container-dark bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl">
                <img src={profile?.profile_image_url ? (profile.profile_image_url.startsWith('http') ? profile.profile_image_url : `${BASE_URL}${profile.profile_image_url}`) : `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}+${profile?.last_name || ''}&size=256`} className="w-full h-full object-cover" alt="avatar" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-white text-2xl">edit</span>
              </div>
              <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => window.open(`/profile/${profile.user_id}`, '_blank')} className="btn-secondary">View Public</button>
              <button form="profile-form" disabled={saving} className="btn-primary">{saving ? 'Saving Changes...' : 'Save Settings'}</button>
            </div>
          </div>

          <form id="profile-form" onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="section-label">Professional Headline</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Senior Full Stack Engineer" 
                  value={profile.headline || ''} 
                  onChange={(e) => setProfile(p => ({ ...p, headline: e.target.value }))}
                />
              </div>
              <div>
                <label className="section-label">Current Location</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. San Francisco, CA" 
                  value={profile.location || ''} 
                  onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="section-label">Professional Bio</label>
              <textarea 
                className="input-field min-h-[120px] resize-none" 
                placeholder="Tell the world about your experience and philosophy..." 
                value={profile.bio || ''} 
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            {profile.role === 'freelancer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <label className="section-label">Hourly Rate (PKR)</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={profile.hourly_rate || ''} 
                    onChange={(e) => setProfile(p => ({ ...p, hourly_rate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="section-label">Years of Experience</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={profile.experience_years || ''} 
                    onChange={(e) => setProfile(p => ({ ...p, experience_years: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="section-label">Availability Status</label>
                  <select 
                    className="input-field appearance-none" 
                    value={profile.availability_status || 'available'} 
                    onChange={(e) => setProfile(p => ({ ...p, availability_status: e.target.value }))}
                  >
                    <option value="available">Open for Work</option>
                    <option value="busy">Working on Projects</option>
                    <option value="unavailable">Away / Vacation</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
