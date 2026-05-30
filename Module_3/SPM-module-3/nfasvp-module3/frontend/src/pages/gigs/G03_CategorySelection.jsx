import { useState } from "react";
import { Btn } from "./shared";
import { useCategories } from "../../hooks/useCategories";

const CATEGORIES = [
  { icon: "💻", name: "Web Development",   count: 124 },
  { icon: "🎨", name: "Graphic Design",    count: 89  },
  { icon: "✍️", name: "Content Writing",   count: 67  },
  { icon: "📱", name: "Mobile Apps",       count: 54  },
  { icon: "📊", name: "Data & Analytics",  count: 43  },
  { icon: "🎬", name: "Video & Animation", count: 38  },
  { icon: "📣", name: "Digital Marketing", count: 72  },
  { icon: "🎵", name: "Music & Audio",     count: 21  },
  { icon: "🌍", name: "Translation",       count: 19  },
];

const TRENDING_TAGS = ["React", "Figma", "Python", "WordPress", "SEO", "Logo Design", "Video Editing", "Copywriting", "Excel"];

// ══════════════════════════════════════════════════════════════════════════════
// G03_CategorySelection
// ══════════════════════════════════════════════════════════════════════════════
export default function CategorySelection({ onNavigate }) {
  const { categories, loading, error } = useCategories();

  // If no backend categories, fallback to mock data
  const catsToRender = categories?.length > 0 ? categories.map(c => ({
    id: c.id,
    icon: c.icon_url || "💻", 
    name: c.name,
    count: c.jobs_count || 0 
  })) : CATEGORIES;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary uppercase tracking-tighter leading-none">
            Marketplace Taxonomy
          </h1>
          <p className="text-slate-500 font-medium italic">
            Explore verified professional sectors and specialized service streams.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xl group">
          <input
            placeholder="Search expertise domains..."
            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-6 py-4 pl-14 text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-xl transition-all group-hover:border-primary/30"
          />
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors">search</span>
        </div>
      </div>

      {/* ── Category Grid ── */}
      {loading ? (
        <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300 italic">Mapping Industrial Domains...</div>
      ) : error ? (
        <div className="py-20 text-center text-error font-black uppercase tracking-widest">Protocol Error: {error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catsToRender.map((cat, i) => (
            <div
              key={i}
              onClick={() => onNavigate("browsejobs", { categoryId: cat.id })}
              className="bg-surface-container-lowest border border-outline-variant/5 rounded-3xl p-8 flex items-center gap-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <div className="font-black text-primary uppercase tracking-tight group-hover:text-tertiary-container transition-colors">{cat.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cat.count} active mandates</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Trending Skill Tags ── */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
           High-Velocity Expertise
        </h3>
        <div className="flex flex-wrap gap-3">
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onNavigate("browsejobs", { q: tag })}
              className="px-5 py-2 rounded-xl bg-surface-container border border-outline-variant/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Admin Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-surface-container-high/30 border border-outline-variant/10 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Governance Protocol</span>
          </div>
          <h4 className="text-xl font-black text-primary uppercase tracking-tight">
            Taxonomy Management System
          </h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
            Hierarchical structure for global marketplace synchronization. Metadata controlled by the Editorial Engine Design Protocol v1.0.
          </p>
          <div className="pt-4">
            <Btn variant="outlined" className="h-10 text-[10px]">Access Admin Console</Btn>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-4">
           <span className="material-symbols-outlined text-4xl text-primary">hub</span>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-relaxed">Cross-module synchronization active for G03, G07, and G08 modules.</p>
        </div>
      </div>
    </div>
  );
}
