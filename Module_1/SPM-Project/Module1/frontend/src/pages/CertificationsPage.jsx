import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import IntegrationBanner from '../components/shared/IntegrationBanner';

export default function CertificationsPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ certification_name: '', issuing_authority: '', credential_id: '', issue_date: '', expiry_date: '', verification_url: '' });
  const [file, setFile] = useState(null);
  
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef();

  const loadCerts = async () => {
    try {
      const res = await api.get(`/certifications/${user.id}`);
      setCerts(res.data.certifications || []);
    } catch (err) {
      // Handle error quietly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCerts(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (file) data.append('certificate', file);

    try {
      if (formData.id) {
        await api.put(`/certifications/${formData.id}`, formData);
        addToast('Certification updated!', 'success');
      } else {
        await api.post('/certifications', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        addToast('Certification submitted for review!', 'success');
      }
      setShowModal(false);
      loadCerts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (certId) => {
    try {
      await api.delete(`/certifications/${certId}`);
      addToast('Certification removed', 'success');
      loadCerts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Verified Credentials</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Certifications</h2>
        </div>
        <button onClick={() => { setFormData({ certification_name: '', issuing_authority: '', credential_id: '', issue_date: '', expiry_date: '', verification_url: '' }); setFile(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(certs) ? certs : []).map((cert) => (
          <div key={cert.id} className="card p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div className="flex gap-2">
                <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                  cert.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                  cert.verification_status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {cert.verification_status}
                </div>
                <button onClick={() => handleDelete(cert.id)} className="w-8 h-8 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">{cert.certification_name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{cert.issuing_authority}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Credential ID</p>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{cert.credential_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Issued</p>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {cert.rejection_reason && cert.verification_status === 'rejected' && (
              <div className="mt-4 p-3 bg-rose-500/5 rounded-lg border border-rose-500/10">
                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">Rejection Reason:</p>
                <p className="text-[10px] text-rose-400 italic">{cert.rejection_reason}</p>
              </div>
            )}
          </div>
        ))}

        {(Array.isArray(certs) ? certs : []).length === 0 && (
          <div className="md:col-span-3 card p-20 text-center border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-white/10 mb-4">license</span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No verified certifications found</p>
            <button onClick={() => setShowModal(true)} className="btn-ghost mt-4">Upload Credential</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-xl p-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Verify Credential</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="section-label">Certification Name</label>
                <input required className="input-field" placeholder="e.g. AWS Certified Solutions Architect" value={formData.certification_name} onChange={(e) => setFormData(p => ({ ...p, certification_name: e.target.value }))} />
              </div>
              <div>
                <label className="section-label">Issuing Authority</label>
                <input required className="input-field" placeholder="e.g. Amazon Web Services" value={formData.issuing_authority} onChange={(e) => setFormData(p => ({ ...p, issuing_authority: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Credential ID</label>
                  <input className="input-field" placeholder="Optional" value={formData.credential_id} onChange={(e) => setFormData(p => ({ ...p, credential_id: e.target.value }))} />
                </div>
                <div>
                  <label className="section-label">Verification URL</label>
                  <input className="input-field" placeholder="https://..." value={formData.verification_url} onChange={(e) => setFormData(p => ({ ...p, verification_url: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Issue Date</label>
                  <input type="date" required className="input-field" value={formData.issue_date} onChange={(e) => setFormData(p => ({ ...p, issue_date: e.target.value }))} />
                </div>
                <div>
                  <label className="section-label">Expiry Date</label>
                  <input type="date" className="input-field" value={formData.expiry_date} onChange={(e) => setFormData(p => ({ ...p, expiry_date: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="section-label">Certificate Evidence (PDF/Image)</label>
                <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-all">
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20 mb-2">upload_file</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{file ? file.name : 'Click to select certificate'}</p>
                </div>
                <input type="file" ref={fileRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Discard</button>
                <button type="submit" className="flex-1 btn-primary">Submit for Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
