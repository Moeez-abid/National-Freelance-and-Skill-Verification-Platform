import { useState, useEffect } from "react";
import { VerifiedBadge, Stars, Btn } from "./shared";
import { useGig } from "../../hooks/useGigs";

// ══════════════════════════════════════════════════════════════════════════════
// G03_GigDetail
// ══════════════════════════════════════════════════════════════════════════════
export default function GigDetail({ onNavigate, params, role }) {
  const [tab, setTab] = useState("About This Gig");
  const [pricing, setPricing] = useState("Basic");

  const TABS = ["About This Gig", "Reviews", "FAQ"];

  const TIERS_FALLBACK = {
    Basic: {
      price: "PKR 5,000", delivery: "3 days", revisions: "1 revision",
      desc: "Perfect for startups. A single landing page with up to 5 sections.",
      deliverables: ["Fully responsive design", "Source files included"],
    },
    Standard: {
      price: "PKR 10,000", delivery: "5 days", revisions: "3 revisions",
      desc: "Ideal for growing businesses. Up to 10 pages and e-commerce.",
      deliverables: ["Everything in Basic", "E-commerce integration"],
    },
    Premium: {
      price: "PKR 18,000", delivery: "10 days", revisions: "Unlimited",
      desc: "Full-scale solution with custom features and admin dashboard.",
      deliverables: ["Everything in Standard", "Admin dashboard"],
    },
  };

  const { gig, loading, error } = useGig(params?.id);
  const realTiers = gig?.pricing_tiers || [];

  useEffect(() => {
    if (realTiers.length > 0) {
      const active = realTiers.find(t => t.tier === pricing.toLowerCase());
      if (!active) {
         const firstTier = realTiers[0].tier;
         setPricing(firstTier.charAt(0).toUpperCase() + firstTier.slice(1));
      }
    }
  }, [realTiers]);

  const activeTier = realTiers.find(t => t.tier === pricing.toLowerCase());
  
  const tier = activeTier ? {
    price: `PKR ${activeTier.price}`,
    delivery: `${activeTier.delivery_days} days`,
    revisions: "Included",
    desc: activeTier.desc || "No package description.",
    deliverables: activeTier.deliverables || [activeTier.desc || "Standard deliverable"]
  } : TIERS_FALLBACK[pricing];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {loading ? (
          <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300 italic">Decrypting Service Data...</div>
        ) : (error || !gig) ? (
          <div className="py-20 flex flex-col items-center gap-6 max-w-lg mx-auto text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-primary uppercase tracking-tight">{error || "Access Denied: Gig Not Found"}</h2>
               <p className="text-slate-500 font-medium">The requested professional service has been removed or is restricted.</p>
            </div>
            <Btn onClick={() => onNavigate("browse")} variant="outlined">Back to Marketplace</Btn>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto py-10 space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <button onClick={() => onNavigate("browse")} className="hover:text-primary transition-colors">Marketplace</button>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary">{gig.title?.substring(0, 30)}...</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 space-y-10">
                <div className="space-y-6">
                  <h1 className="text-5xl font-black text-primary uppercase tracking-tighter leading-none">{gig.title}</h1>
                  
                  <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
                    <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black text-xl shadow-lg">
                      {gig.freelancer_id?.substring(0, 2).toUpperCase() || "FR"}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-primary text-lg">Freelancer {gig.freelancer_id?.substring(0, 4)}</span>
                        <VerifiedBadge />
                      </div>
                      <Stars rating={gig.avg_rating || "0.0"} count={gig.review_count || "0"} />
                    </div>
                  </div>
                </div>

                <div className="aspect-video bg-surface-container-high rounded-3xl flex items-center justify-center relative overflow-hidden group border border-outline-variant/15 shadow-inner">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                   <span className="text-[120px] group-hover:scale-110 transition-transform duration-700">{gig.icon || "💻"}</span>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-10 border-b border-outline-variant/10">
                    {TABS.map(t => (
                      <button key={t} onClick={() => setTab(t)} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tab === t ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}>
                        {t}
                        {tab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                      </button>
                    ))}
                  </div>

                  {tab === "About This Gig" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-primary uppercase tracking-tight">Service Mandate</h3>
                        <p className="text-slate-500 leading-loose text-lg font-medium italic">
                          {gig.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-sm font-black text-primary uppercase tracking-widest">Expertise Deployed</h3>
                         <div className="flex gap-3 flex-wrap">
                            {(gig.required_skills || ["Service"]).map(s => (
                              <span key={s} className="bg-surface-container text-primary border border-outline-variant/10 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                {s}
                              </span>
                            ))}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN (The "Purchase" Card) */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="bg-surface-container-lowest border-2 border-primary rounded-3xl overflow-hidden shadow-2xl">
                   <div className="flex bg-surface-container p-1 gap-1">
                      {["Basic", "Standard", "Premium"].map(p => (
                        <button key={p} onClick={() => setPricing(p)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl ${pricing === p ? 'bg-primary text-on-primary shadow-lg' : 'text-slate-400 hover:bg-surface-container-high'}`}>
                          {p}
                        </button>
                      ))}
                   </div>

                   <div className="p-8 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Editorial Package</h4>
                           <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">{tier.price}</h2>
                        </div>
                        <div className="bg-tertiary-fixed-dim/20 text-tertiary-fixed text-[9px] font-black px-2 py-1 rounded">LVL {pricing === "Basic" ? "01" : pricing === "Standard" ? "02" : "03"}</div>
                      </div>

                      <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-2 border-outline-variant/20 pl-4">{tier.desc}</p>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-surface-container p-3 rounded-2xl space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Lead Time</span>
                            <span className="text-xs font-black text-primary uppercase">⏱ {tier.delivery}</span>
                         </div>
                         <div className="bg-surface-container p-3 rounded-2xl space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Iterative Cycles</span>
                            <span className="text-xs font-black text-primary uppercase">🔄 {tier.revisions}</span>
                         </div>
                      </div>

                      <div className="space-y-3">
                         {tier.deliverables.map(d => (
                           <div key={d} className="flex gap-3 items-center text-xs font-black text-primary uppercase tracking-wide">
                             <span className="material-symbols-outlined text-tertiary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                             <span>{d}</span>
                           </div>
                         ))}
                      </div>

                      <div className="space-y-3 pt-4">
                        <Btn className="w-full shadow-lg shadow-primary/20 h-14 text-sm" onClick={() => onNavigate("order", { id: gig.id, tier: pricing })}>Initiate Project</Btn>
                        <Btn variant="outlined" className="w-full h-12" onClick={() => onNavigate("chat", { freelancerId: gig.freelancer_id })}>Direct Inquire</Btn>
                      </div>
                   </div>
                </div>

                <div className="mt-6 p-4 bg-tertiary-fixed-variant/5 border border-tertiary-fixed-dim/10 rounded-2xl flex gap-3 items-center">
                   <span className="material-symbols-outlined text-tertiary-fixed text-xl">verified_user</span>
                   <p className="text-[10px] font-bold text-on-tertiary-fixed-variant uppercase tracking-widest">Secured by Nexus Protection Systems</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
