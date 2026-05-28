import React, { useEffect, useState, useRef } from 'react';
import { portfolioService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import IntegrationBanner from '../components/shared/IntegrationBanner';

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', project_url: '', github_url: '', technologies: '', is_featured: false });
  const [uploading, setUploading] = useState(false);
  
  const fileRef = useRef();
  const { addToast } = useToast();

  const loadProjects = async () => {
    try {
      const res = await portfolioService.getMyPortfolio();
      setProjects(res.data.projects || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { ...formData, technologies: typeof formData.technologies === 'string' ? formData.technologies.split(',').map(s => s.trim()) : formData.technologies };
    try {
      if (editingProject) {
        await portfolioService.updateProject(editingProject.id, data);
        addToast('Project updated!', 'success');
      } else {
        await portfolioService.createProject(data);
        addToast('Project created!', 'success');
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await portfolioService.deleteProject(id);
      addToast('Project deleted', 'success');
      loadProjects();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleImageUpload = async (projectId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await portfolioService.uploadProjectImage(projectId, file);
      addToast('Image uploaded!', 'success');
      loadProjects();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <IntegrationBanner featureName="Portfolio & Assets" />
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Creative Assets</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Portfolio Projects</h2>
        </div>
        <button 
          onClick={() => { setEditingProject(null); setFormData({ title: '', description: '', project_url: '', github_url: '', technologies: '', is_featured: false }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Array.isArray(projects) ? projects : []).map((project) => (
          <div key={project.id} className="card group bg-white dark:bg-surface-container-dark overflow-hidden flex flex-col">
            <div className="h-56 bg-slate-100 dark:bg-white/5 relative overflow-hidden">
              {project.featured_image ? (
                <img src={project.featured_image.startsWith('http') ? project.featured_image : `http://localhost:5001${project.featured_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-[10px] uppercase tracking-widest">No Featured Image</div>
              )}
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                <button onClick={() => { setEditingProject(project); handleImageUpload(project.id, { target: { files: [] } }); fileRef.current.click(); }} className="btn-primary py-2 px-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">photo_camera</span> Replace
                </button>
              </div>
              <input type="file" ref={fileRef} className="hidden" onChange={(e) => handleImageUpload(project.id, e)} />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{project.title}</h3>
                  {project.is_featured && <span className="material-symbols-outlined text-accent fill-accent text-sm" title="Featured Project">grade</span>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed italic">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies?.map(tech => (
                    <span key={tech} className="badge-tag">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-4">
                  {project.project_url && <a href={project.project_url} target="_blank" className="text-slate-400 hover:text-accent transition-colors"><span className="material-symbols-outlined">language</span></a>}
                  {project.github_url && <a href={project.github_url} target="_blank" className="text-slate-400 hover:text-accent transition-colors"><span className="material-symbols-outlined">code</span></a>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingProject(project); setFormData({ ...project, technologies: project.technologies?.join(', ') }); setShowModal(true); }} className="btn-secondary px-4 py-2">Edit</button>
                  <button onClick={() => handleDelete(project.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl p-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">{editingProject ? 'Modify Project' : 'Publish New Project'}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="section-label">Project Title</label>
                <input required className="input-field" placeholder="e.g. Nexus Pro Dashboard" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="section-label">Description</label>
                <textarea className="input-field min-h-[100px] resize-none" placeholder="Explain the project goal and your role..." value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}></textarea>
              </div>
              <div>
                <label className="section-label">Live Project URL</label>
                <input className="input-field" placeholder="https://..." value={formData.project_url} onChange={(e) => setFormData(p => ({ ...p, project_url: e.target.value }))} />
              </div>
              <div>
                <label className="section-label">Source Code URL</label>
                <input className="input-field" placeholder="https://github.com/..." value={formData.github_url} onChange={(e) => setFormData(p => ({ ...p, github_url: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="section-label">Technologies (Comma separated)</label>
                <input className="input-field" placeholder="React, Node.js, Tailwind..." value={formData.technologies} onChange={(e) => setFormData(p => ({ ...p, technologies: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 md:col-span-2 bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                <input type="checkbox" id="featured" className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/50" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} />
                <label htmlFor="featured" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Pin to Featured Section</label>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Discard</button>
                <button type="submit" className="flex-1 btn-primary">Publish Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
