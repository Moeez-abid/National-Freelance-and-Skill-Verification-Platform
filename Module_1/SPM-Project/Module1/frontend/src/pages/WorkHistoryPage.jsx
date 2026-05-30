import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import IntegrationBanner from '../components/shared/IntegrationBanner';

export default function WorkHistoryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false, description: '', location: '' });
  
  const { user } = useAuth();
  const { addToast } = useToast();

  const loadHistory = async () => {
    try {
      const res = await api.get(`/work/${user.id}`);
      setEntries(res.data.work_history || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await api.put(`/work/${editingEntry.id}`, formData);
        addToast('History updated!', 'success');
      } else {
        await api.post('/work', formData);
        addToast('History entry added!', 'success');
      }
      setShowModal(false);
      loadHistory();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this work history entry?')) return;
    try {
      await api.delete(`/work/${id}`);
      addToast('Entry removed', 'success');
      loadHistory();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <IntegrationBanner featureName="Work History & Experience" />
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Professional Timeline</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Work History</h2>
        </div>
        <button 
          onClick={() => { setEditingEntry(null); setFormData({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false, description: '', location: '' }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Position
        </button>
      </div>

      <div className="space-y-8 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-white/10">
        {(Array.isArray(entries) ? entries : []).map((entry) => (
          <div key={entry.id} className="relative pl-16 group">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-xl bg-white dark:bg-surface-container-dark border-2 border-slate-200 dark:border-white/10 flex items-center justify-center z-10 group-hover:border-accent transition-colors">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-accent">{entry.is_current ? 'work_history' : 'corporate_fare'}</span>
            </div>
            
            <div className="card p-6 hover:border-accent/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{entry.job_title}</h3>
                    {entry.is_current && <span className="badge-tag bg-emerald-500/10 text-emerald-500 border-none">Current</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.company_name} • {entry.location || 'Remote'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEntry(entry); setFormData({ ...entry, start_date: entry.start_date.split('T')[0], end_date: entry.end_date?.split('T')[0] }); setShowModal(true); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary dark:hover:text-accent transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                  <button onClick={() => handleDelete(entry.id)} className="w-8 h-8 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                {new Date(entry.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} — {entry.is_current ? 'Present' : new Date(entry.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-white/5 pt-4">{entry.description}</p>
            </div>
          </div>
        ))}

        {(Array.isArray(entries) ? entries : []).length === 0 && (
          <div className="card p-20 text-center border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-white/10 mb-4">history_edu</span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your professional timeline is empty</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-xl p-8 animate-scale-up">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">{editingEntry ? 'Update Experience' : 'Add New Experience'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Company Name</label>
                  <input required className="input-field" placeholder="e.g. Google" value={formData.company_name} onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))} />
                </div>
                <div>
                  <label className="section-label">Job Title</label>
                  <input required className="input-field" placeholder="e.g. Senior Architect" value={formData.job_title} onChange={(e) => setFormData(p => ({ ...p, job_title: e.target.value }))} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Start Date</label>
                  <input type="date" required className="input-field" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="section-label">End Date</label>
                  <input type="date" disabled={formData.is_current} className="input-field disabled:opacity-30" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                <input type="checkbox" id="current" className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/50" checked={formData.is_current} onChange={(e) => setFormData(p => ({ ...p, is_current: e.target.checked, end_date: e.target.checked ? '' : p.end_date }))} />
                <label htmlFor="current" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">I am currently working in this role</label>
              </div>

              <div>
                <label className="section-label">Location</label>
                <input className="input-field" placeholder="e.g. London, UK / Remote" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div>
                <label className="section-label">Description</label>
                <textarea required className="input-field min-h-[100px] resize-none" placeholder="Summarize your impact and achievements..." value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Discard</button>
                <button type="submit" className="flex-1 btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
