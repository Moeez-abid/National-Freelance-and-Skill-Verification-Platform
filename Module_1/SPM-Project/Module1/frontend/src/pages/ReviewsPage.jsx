import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import IntegrationBanner from '../components/shared/IntegrationBanner';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '', communication_rating: 5, quality_rating: 5, deadline_rating: 5 });
  
  const { user } = useAuth();
  const { addToast } = useToast();

  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState('');

  const loadReviews = async () => {
    try {
      // If client, we need to load reviews for a selected freelancer or show empty
      // If freelancer, load for me
      const targetId = user.role === 'client' ? selectedFreelancer : user.id;
      if (targetId) {
        const res = await api.get(`/reviews/${targetId}`);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      // Quietly handle
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancers = async () => {
    if (user.role === 'client') {
      try {
        const res = await api.get('/leaderboard'); // Using leaderboard to get active freelancers
        setFreelancers(res.data.leaderboard || []);
      } catch (err) {}
    }
  };

  useEffect(() => { 
    loadReviews(); 
    loadFreelancers();
  }, [selectedFreelancer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFreelancer) {
      addToast('Please select a freelancer to review', 'error');
      return;
    }

    try {
      await api.post(`/reviews/${selectedFreelancer}`, formData);
      addToast('Review published successfully!', 'success');
      setShowModal(false);
      loadReviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`material-symbols-outlined text-xl transition-all ${star <= value ? 'text-accent fill-current' : 'text-slate-200 dark:text-white/10'}`}
        >
          star
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Reputation Log</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            {user.role === 'client' ? 'Submit Feedback' : 'Client Reviews'}
          </h2>
        </div>
        {user.role === 'client' && (
          <div className="flex gap-4">
            <select 
              className="input-field py-2 text-xs"
              value={selectedFreelancer}
              onChange={(e) => setSelectedFreelancer(e.target.value)}
            >
              <option value="">Select Freelancer...</option>
              {freelancers.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button 
              disabled={!selectedFreelancer}
              onClick={() => { setFormData({ rating: 5, comment: '', communication_rating: 5, quality_rating: 5, deadline_rating: 5 }); setShowModal(true); }} 
              className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">rate_review</span>
              Write Review
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {(Array.isArray(reviews) ? reviews : []).map((review, i) => (
          <div key={i} className="card p-8 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-xs">
                  {review.reviewer_name?.substring(0, 2).toUpperCase() || 'CL'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{review.reviewer_name || 'Anonymous Client'}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <StarRating value={review.rating} readonly />
            </div>

            <p className="text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed text-lg">"{review.comment}"</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-white/5">
              {[
                { label: 'Communication', value: review.communication_rating },
                { label: 'Work Quality', value: review.quality_rating },
                { label: 'Deadline Met', value: review.deadline_rating },
              ].map(sub => (
                <div key={sub.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sub.label}</span>
                    <span className="text-[10px] font-bold text-primary dark:text-accent">{sub.value}/5</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(sub.value / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(Array.isArray(reviews) ? reviews : []).length === 0 && (
          <div className="card p-20 text-center border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-white/10 mb-4">forum</span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No feedback has been recorded yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-xl p-8 animate-scale-up">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Leave a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl text-center">
                <p className="section-label mb-2">Overall Experience</p>
                <div className="flex justify-center scale-150 py-2">
                  <StarRating value={formData.rating} onChange={(v) => setFormData(p => ({ ...p, rating: v }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="section-label">Communication</label>
                  <StarRating value={formData.communication_rating} onChange={(v) => setFormData(p => ({ ...p, communication_rating: v }))} />
                </div>
                <div>
                  <label className="section-label">Quality</label>
                  <StarRating value={formData.quality_rating} onChange={(v) => setFormData(p => ({ ...p, quality_rating: v }))} />
                </div>
                <div>
                  <label className="section-label">Deadline</label>
                  <StarRating value={formData.deadline_rating} onChange={(v) => setFormData(p => ({ ...p, deadline_rating: v }))} />
                </div>
              </div>

              <div>
                <label className="section-label">Your Feedback</label>
                <textarea 
                  required 
                  className="input-field min-h-[120px] resize-none" 
                  placeholder="Tell us about the project outcome..."
                  value={formData.comment}
                  onChange={(e) => setFormData(p => ({ ...p, comment: e.target.value }))}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Discard</button>
                <button type="submit" className="flex-1 btn-primary">Publish Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
