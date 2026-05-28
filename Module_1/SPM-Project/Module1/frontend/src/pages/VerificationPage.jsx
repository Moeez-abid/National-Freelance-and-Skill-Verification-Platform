import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import IntegrationBanner from '../components/shared/IntegrationBanner';

export default function VerificationPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ verification_type: 'identity', document_type: '' });
  const [file, setFile] = useState(null);
  
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef();

  const loadRequests = async () => {
    try {
      const res = await api.get(`/verification/${user.id}`);
      setRequests(res.data.requests || []);
    } catch (err) {
      addToast('Failed to load verification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('verification_type', formData.verification_type);
    data.append('document_type', formData.document_type);
    if (file) data.append('document', file);

    try {
      await api.post('/verification/request', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Request submitted successfully!', 'success');
      setShowModal(false);
      loadRequests();
    } catch (err) {
      addToast('Submission failed', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  const currentStatus = (Array.isArray(requests) ? requests : []).find(r => r.verification_status === 'verified') ? 'verified' : 
                        (Array.isArray(requests) ? requests : []).find(r => r.verification_status === 'pending') ? 'pending' : 'unverified';

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <IntegrationBanner featureName="Trust & Verification" />
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Trust & Safety</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Identity Verification</h2>
        </div>
      </div>

      {/* Main Status Card */}
      <div className={`card p-10 text-center relative overflow-hidden border-none ${
        currentStatus === 'verified' ? 'bg-emerald-500 text-white' : 
        currentStatus === 'pending' ? 'bg-amber-500 text-white' : 
        'bg-slate-900 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
            <span className="material-symbols-outlined text-4xl">{
              currentStatus === 'verified' ? 'verified_user' : 
              currentStatus === 'pending' ? 'hourglass_empty' : 'gpp_maybe'
            }</span>
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">
            {currentStatus === 'verified' ? 'Account Verified' : 
             currentStatus === 'pending' ? 'Verification Pending' : 'Action Required'}
          </h3>
          <p className="text-sm font-medium opacity-80 mb-8 max-w-md mx-auto">
            {currentStatus === 'verified' ? 'Your professional identity has been successfully validated. You now have full access to premium features.' : 
             currentStatus === 'pending' ? 'Our security team is currently reviewing your documents. This usually takes 24-48 hours.' : 
             'Complete your verification to earn the "Verified" badge and increase your visibility to premium clients.'}
          </p>
          {currentStatus === 'unverified' && (
            <button onClick={() => setShowModal(true)} className="bg-white text-primary px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-label hover:bg-accent transition-all shadow-xl shadow-black/20">
              Start Verification Flow
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Request History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(Array.isArray(requests) ? requests : []).map((req, i) => (
                <tr key={i} className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <td className="px-6 py-4 uppercase">{req.verification_type}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{req.document_type || 'Attached Doc'}</td>
                  <td className="px-6 py-4">{new Date(req.requested_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      req.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 
                      req.verification_status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {req.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
              {(Array.isArray(requests) ? requests : []).length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 uppercase tracking-widest text-[10px]">No verification history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-xl p-8 animate-scale-up">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Identity Verification</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Verification Type</label>
                  <select className="input-field appearance-none" value={formData.verification_type} onChange={(e) => setFormData(p => ({ ...p, verification_type: e.target.value }))}>
                    <option value="identity">National Identity</option>
                    <option value="professional">Professional License</option>
                    <option value="skill">Skill Endorsement</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Document Type</label>
                  <input required className="input-field" placeholder="e.g. Passport, Drivers License" value={formData.document_type} onChange={(e) => setFormData(p => ({ ...p, document_type: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="section-label">Document Upload (Secure)</label>
                <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-accent transition-all group">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-accent mb-2">fingerprint</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{file ? file.name : 'Select file to upload'}</p>
                  <p className="text-[8px] text-slate-400 mt-2">Maximum file size 5MB. PDF or Image accepted.</p>
                </div>
                <input type="file" ref={fileRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Discard</button>
                <button type="submit" className="flex-1 btn-primary">Start Review Process</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
