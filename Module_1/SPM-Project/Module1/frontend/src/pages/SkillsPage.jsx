import React, { useEffect, useState } from 'react';
import { skillsService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ skill_id: '', skill_level: 'intermediate', years_of_experience: 1 });
  
  const { user } = useAuth();
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      const [userRes, globalRes] = await Promise.all([
        skillsService.getUserSkills(),
        skillsService.getAllSkills()
      ]);
      setSkills(userRes.data.skills || []);
      setGlobalSkills(globalRes.data.skills || []);
    } catch (err) {
      // Silently handle empty/fail for clean UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await skillsService.updateUserSkill(editingSkill.skill_id, formData);
        addToast('Skill updated!', 'success');
      } else {
        await skillsService.addUserSkill(formData);
        addToast('Skill added!', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (skillId) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    try {
      await skillsService.deleteUserSkill(skillId);
      addToast('Skill removed', 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <p className="section-label">Expertise Matrix</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Manage Skills</h2>
        </div>
        <button 
          onClick={() => { setEditingSkill(null); setFormData({ skill_id: '', skill_level: 'intermediate', years_of_experience: 1 }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(skills) ? skills : []).map((skill) => (
          <div key={skill.skill_id} className="card p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{skill.skill_name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{skill.category || 'Professional'}</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setEditingSkill(skill); setFormData({ skill_id: skill.skill_id, skill_level: skill.skill_level, years_of_experience: skill.years_of_experience }); setShowModal(true); }} 
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => handleDelete(skill.skill_id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Proficiency</span>
                <span className="text-primary dark:text-accent">{skill.skill_level}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000" 
                  style={{ width: skill.skill_level === 'expert' ? '100%' : skill.skill_level === 'advanced' ? '75%' : skill.skill_level === 'intermediate' ? '50%' : '25%' }}
                ></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {skill.years_of_experience} Years Experience
              </div>
            </div>
          </div>
        ))}

        {(Array.isArray(skills) ? skills : []).length === 0 && (
          <div className="md:col-span-3 card p-20 text-center border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-white/10 mb-4">psychology</span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No skills added to your matrix yet</p>
            <button onClick={() => setShowModal(true)} className="btn-ghost mt-4">Start Building Portfolio</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-8 animate-scale-up">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              {!editingSkill && (
                <div>
                  <label className="section-label">Select Skill</label>
                  <select 
                    className="input-field appearance-none" 
                    required
                    value={formData.skill_id}
                    onChange={(e) => setFormData(p => ({ ...p, skill_id: e.target.value }))}
                  >
                    <option value="">Choose Expertise...</option>
                    {globalSkills.filter(gs => !skills.find(s => s.skill_id === gs.id)).map(gs => (
                      <option key={gs.id} value={gs.id}>{gs.skill_name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="section-label">Skill Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {['beginner', 'intermediate', 'advanced', 'expert'].map(lvl => (
                    <button 
                      key={lvl}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, skill_level: lvl }))}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-label transition-all ${formData.skill_level === lvl ? 'bg-primary text-white dark:bg-accent dark:text-primary shadow-lg shadow-accent/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label">Years of Experience</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="input-field" 
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData(p => ({ ...p, years_of_experience: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
