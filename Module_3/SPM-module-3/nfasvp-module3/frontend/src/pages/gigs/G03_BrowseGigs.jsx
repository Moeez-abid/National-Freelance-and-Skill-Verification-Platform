import { useState, useMemo } from "react";
import { VerifiedBadge, Stars, Btn } from "./shared";
import { useGigs } from "../../hooks/useGigs";
import { useCategories } from "../../hooks/useCategories";

// ─── GIG CARD ────────────────────────────────────────────────────────────────
function GigCard({ gig, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate("detail", { id: gig.id })}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col group"
    >
      {/* Thumbnail */}
      <div className="h-32 bg-surface-container flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-primary to-transparent" />
        <span className="text-4xl relative z-10">{gig.icon}</span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0">
            {gig.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <div className="font-bold text-xs text-primary">{gig.name}</div>
            <Stars rating={gig.rating} count={gig.reviews} />
          </div>
        </div>

        <p className="text-sm font-bold text-primary leading-tight line-clamp-2 h-10">
          {gig.title}
        </p>

        <div className="flex gap-2 flex-wrap">
          {gig.tags.map(t => (
            <span key={t} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{t}</span>
          ))}
          <VerifiedBadge />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Starts From</span>
            <span className="font-black text-sm text-primary uppercase">{gig.price}</span>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-tighter">Delivery</span>
             <span className="text-[10px] font-black text-primary">{gig.delivery}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// G03_BrowseGigs
// ══════════════════════════════════════════════════════════════════════════════
export default function BrowseGigs({ onNavigate, role }) {
  const { categories } = useCategories();
  const [activeFilter, setActiveFilter] = useState("All");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [delivery, setDelivery] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    return { page, q: search, sort, ...appliedFilters };
  }, [page, search, appliedFilters]);

  const { gigs, loading, error, meta } = useGigs(filters);

  const handleApplyFilters = () => {
    const f = {};
    if (activeFilter !== "All") f.category_id = activeFilter;
    if (budgetMin) f.price_min = budgetMin;
    if (budgetMax) f.price_max = budgetMax;
    if (delivery && delivery !== "Any") f.max_delivery_days = delivery.replace(/\D/g, "");
    setAppliedFilters(f);
    setPage(1);
  };

  const handleClearFilters = () => {
    setBudgetMin(""); setBudgetMax(""); setDelivery("Any"); setActiveFilter("All"); setSearch(""); setSort("newest"); setAppliedFilters({}); setPage(1);
  };

  const FILTERS = ["All", "Web Dev", "Design", "Writing", "Marketing", "Data", "Video"];

  const mappedGigs = useMemo(() => {
    if (!gigs) return [];
    return gigs.map(g => {
      const basicTier = g.pricing_tiers?.[0] || {};
      return {
        id: g.id,
        name: `Freelancer ${g.freelancer_id?.substring(0, 4) || ''}`,
        rating: g.avg_rating || "0.0",
        reviews: g.review_count || "0",
        title: g.title,
        tags: Array.isArray(g.required_skills) ? g.required_skills.map(s => typeof s === 'string' ? s : (s.tag?.name || s.name || s.tag || 'Skill')).slice(0, 2) : ["Skill"],
        price: `PKR ${basicTier.price || 'N/A'}`,
        delivery: `${basicTier.delivery_days || '?'} days`,
        color: "#E8F4FD", 
        icon: "💻"
      };
    });
  }, [gigs]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex gap-10">
        {/* ── Sidebar ── */}
        <aside className="w-64 flex-shrink-0 space-y-8 sticky top-24 h-fit">
          <div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Market Filters</h3>
            <p className="text-xs text-slate-500 font-medium">Refine editorial listings</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.1em] uppercase text-slate-400">Category</label>
              <select 
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value)}
                className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.1em] uppercase text-slate-400">Budget Range (PKR)</label>
              <div className="flex gap-2">
                <input placeholder="Min" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-lg px-3 py-2 text-xs" />
                <input placeholder="Max" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/15 rounded-lg px-3 py-2 text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.1em] uppercase text-slate-400">Delivery Time</label>
              <div className="space-y-2">
                {["Any", "Up to 1 day", "Up to 3 days", "Up to 7 days"].map(d => (
                  <label key={d} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="delivery" value={d} checked={delivery === d} onChange={() => setDelivery(d)} className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/20" />
                    <span className="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/10 flex flex-col gap-3">
              <Btn onClick={handleApplyFilters} className="w-full">Apply Filters</Btn>
              <Btn onClick={handleClearFilters} variant="ghost" className="w-full text-[10px]">Clear All</Btn>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="border-l-4 border-tertiary-fixed pl-6">
              <h1 className="text-4xl font-black text-primary uppercase tracking-tight">Gig Marketplace</h1>
              <p className="text-slate-500 font-medium">Explore premium professional services curated for excellence.</p>
            </div>

            <div className="relative max-w-2xl">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search services, skills, or experts..."
                className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 rounded-xl px-6 py-4 pl-12 text-sm shadow-sm focus:ring-2 focus:ring-tertiary outline-none transition-all"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f}
                  onClick={() => { 
                    setActiveFilter(f); setPage(1); 
                    const cat = categories.find(c => c.name.toLowerCase().includes(f.toLowerCase()));
                    setAppliedFilters(prev => ({ ...prev, category_id: (f === "All" || !cat) ? "" : cat.id })); 
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing <strong className="text-primary">{meta?.total || 0}</strong> results</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent border-0 text-[10px] font-black uppercase tracking-widest text-primary focus:ring-0 outline-none cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="price_low">Lowest Price</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300">Loading Marketplace...</div>
          ) : error ? (
            <div className="py-20 text-center text-error font-black uppercase tracking-widest">Connection Error: {error}</div>
          ) : mappedGigs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest">No matching services found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mappedGigs.map(g => <GigCard key={g.id} gig={g} onNavigate={onNavigate} />)}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 py-10">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-lg border border-outline-variant/10 flex items-center justify-center text-primary disabled:opacity-30 hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-[10px] font-black transition-all ${page === p ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container text-primary hover:bg-surface-container-high'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => p + 1)} className="w-10 h-10 rounded-lg border border-outline-variant/10 flex items-center justify-center text-primary hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
