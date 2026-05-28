import { useState, useMemo } from "react";
import { SkillTag, StatusBadge, Btn } from "./fbs_shared";
import { useJobs } from "../../hooks/useJobs";

// ─── JOB CARD ────────────────────────────────────────────────────────────────
function JobCard({ job, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate("jobdetail", { id: job.id })}
      className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 flex flex-col justify-between gap-6 hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight group-hover:text-tertiary-container transition-colors">{job.title}</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.client}</span>
              {job.verified && <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{job.posted}</span>
            </div>
          </div>
          <button className="text-slate-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-lg">
            <span className="material-symbols-outlined text-sm text-primary">payments</span>
            <span className="text-xs font-black text-primary uppercase">{job.budget}</span>
          </div>
          <span className="bg-primary text-on-primary px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
            {job.type}
          </span>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
          {job.desc}
        </p>

        <div className="flex gap-2 flex-wrap">
          {job.skills.map(s => (
            <SkillTag key={s} label={s} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-auto">
        <Btn variant="outlined" className="flex-1" onClick={(e) => { e.stopPropagation(); onNavigate("jobdetail", { id: job.id }); }}>View Details</Btn>
        <Btn className="flex-1" onClick={(e) => { e.stopPropagation(); onNavigate("submit", { jobId: job.id }); }}>Bid Now</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 07 - Browse Jobs
// ══════════════════════════════════════════════════════════════════════════════
export default function BrowseJobs({ onNavigate, params, role }) {
  const [search, setSearch] = useState(params?.q || "");
  const [category, setCategory] = useState(params?.categoryId || "");
  const [budget, setBudget] = useState("");
  const [projectType, setProjectType] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    const f = { page, status: 'open' };
    if (projectType) f.project_type = projectType === "Hourly" ? "hourly" : "fixed_price";
    if (search) f.q = search;
    if (category) f.category_id = category;
    if (budget) {
      if (budget === "< $500") { f.budget_max = 500; }
      else if (budget === "$500-$2k") { f.budget_min = 500; f.budget_max = 2000; }
      else if (budget === "$2k-$5k") { f.budget_min = 2000; f.budget_max = 5000; }
      else if (budget === "> $5k") { f.budget_min = 5000; }
    }
    return f;
  }, [projectType, page, search, category, budget]);

  const { jobs, loading, error, meta } = useJobs(filters);

  const mappedJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.map(j => ({
      id: j.id,
      title: j.title,
      client: `Client ${j.client_id?.substring(0,4) || ''}`,
      verified: true,
      budget: j.budget_max ? `PKR ${j.budget_min || 0} – ${j.budget_max}` : `PKR ${j.budget_min || 0}+`,
      posted: new Date(j.created_at).toLocaleDateString(),
      type: j.project_type === 'fixed_price' ? "Fixed Price" : "Hourly",
      skills: Array.isArray(j.required_skills) ? j.required_skills.map(s => typeof s === 'string' ? s : (s.tag?.name || s.name || s.tag || 'Skill')).slice(0, 3) : ["Skill"],
      desc: j.description || "",
    }));
  }, [jobs]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="space-y-10">
        {/* Page Header */}
        <div className="border-l-4 border-primary pl-6">
          <h1 className="text-4xl font-black text-primary uppercase tracking-tight">Open Opportunities</h1>
          <p className="text-slate-500 font-medium italic">High-authority project listings for editorial experts.</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px] space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Search Keywords</label>
              <div className="relative">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="e.g. React Developer, UI Designer..."
                  className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-xl px-4 py-3 pl-10 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all" />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all cursor-pointer min-w-[160px]">
                <option value="">All Categories</option>
                {["Web Dev","Design","Writing","Marketing","Data"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Budget Range</label>
              <select value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all cursor-pointer min-w-[160px]">
                <option value="">Any Budget</option>
                {["< $500","$500-$2k","$2k-$5k","> $5k"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <Btn className="h-[46px] px-10">Search</Btn>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Expertise Tags:</span>
            {["Remote", "Full-Time", "Fixed Budget"].map(chip => (
              <button key={chip} className="px-3 py-1 rounded-full bg-surface-container text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-all">
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count + Sort */}
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing <strong className="text-primary">{meta?.total || 0}</strong> active job postings</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By:</span>
            <select className="bg-transparent border-0 text-[10px] font-black uppercase tracking-widest text-primary focus:ring-0 outline-none cursor-pointer">
              <option>Relevance</option>
              <option>Newest First</option>
              <option>Budget: High to Low</option>
            </select>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300">Loading Opportunities...</div>
        ) : error ? (
          <div className="py-20 text-center text-error font-black uppercase tracking-widest">Connection Error: {error}</div>
        ) : mappedJobs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest">No matching jobs found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mappedJobs.map(job => <JobCard key={job.id} job={job} onNavigate={onNavigate} />)}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 py-10">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-lg border border-outline-variant/10 flex items-center justify-center text-primary disabled:opacity-30 hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3].map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-[10px] font-black transition-all ${page === p ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container text-primary hover:bg-surface-container-high'}`}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={() => setPage(p => p + 1)} className="w-10 h-10 rounded-lg border border-outline-variant/10 flex items-center justify-center text-primary hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
