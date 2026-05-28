import { useState } from "react";
import { Btn } from "../gigs/shared";
import { useMyProjects } from "../../hooks/useProjects";

// ─── PROJECT STATUS CARD ────────────────────────────────────────────────────
function ProjectCard({ project, onNavigate, role }) {
  const statusColors = {
    pending:   "bg-surface-container-high text-on-surface-variant",
    active:    "bg-tertiary-fixed text-on-tertiary-fixed",
    completed: "bg-primary text-on-primary",
    cancelled: "bg-error-container text-on-error-container",
  };
  
  const statusLabels = {
    pending: "Awaiting Start",
    active: "In Progress",
    completed: "Finalized",
    cancelled: "Terminated",
  };

  const stClass = statusColors[project.status] || statusColors.pending;
  const stLabel = statusLabels[project.status] || project.status;

  return (
    <div
      onClick={() => onNavigate("projectdetail", { id: project.id })}
      className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
          {project.type === 'gig' ? '💼' : '🛠️'}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight">
            {project.title || `Project #${project.id.substring(0, 8)}`}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="material-symbols-outlined text-sm">person</span>
               {role === 'client' ? 'Freelancer' : 'Client'}: {project.partner_name || 'Expert'}
            </div>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
               <span className="material-symbols-outlined text-sm">payments</span>
               PKR {project.total_budget || project.amount || '0'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-outline-variant/10 ${stClass}`}>
          {stLabel}
        </span>
        <button className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
          arrow_forward_ios
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// G03_ProjectStatus (Screen 21)
// ══════════════════════════════════════════════════════════════════════════════
export default function ProjectStatus({ onNavigate, role }) {
  const [activeTab, setActiveTab] = useState("all");
  const { projects, loading, error } = useMyProjects({ status: activeTab === 'all' ? null : activeTab });

  const tabs = [
    { id: "all", label: "All Projects" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Awaiting Start" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-l-4 border-tertiary-fixed pl-6">
        <h1 className="text-4xl font-black text-primary uppercase tracking-tight">Project Portfolio</h1>
        <p className="text-slate-500 font-medium">Monitoring enterprise execution and milestone synchronization.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-outline-variant/10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
          >
            {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300 italic">Synchronizing Portfolio Data...</div>
        ) : error ? (
          <div className="py-20 text-center text-error font-black uppercase tracking-widest">Protocol Error: {error}</div>
        ) : projects.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-6 bg-surface-container/30 border-2 border-dashed border-outline-variant/20 rounded-3xl text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200">folder_open</span>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-primary uppercase tracking-tight">No Active Projects</h3>
              <p className="text-sm text-slate-500 font-medium italic">Initiate engagement via the marketplace to begin tracking.</p>
            </div>
            <Btn onClick={() => onNavigate(role === 'client' ? 'browse' : 'browsejobs')} variant="outlined">
              Explore Opportunities
            </Btn>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map(p => <ProjectCard key={p.id} project={p} onNavigate={onNavigate} role={role} />)}
          </div>
        )}
      </div>

      <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 flex gap-4 items-center">
         <div className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Automatic status updates powered by StatusManagementService v2.4</p>
      </div>
    </div>
  );
}
