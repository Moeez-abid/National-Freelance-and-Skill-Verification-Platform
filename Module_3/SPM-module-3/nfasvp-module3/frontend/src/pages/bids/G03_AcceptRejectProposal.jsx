import { useState } from "react";
import { Btn, MilestoneBadge, MILESTONES } from "./fbs_shared";
import { useAcceptBid, useRejectBid, useWithdrawBid, useBid } from "../../hooks/useBids";

// ══════════════════════════════════════════════════════════════════════════════
// 11 - Accept / Reject Proposal
// ══════════════════════════════════════════════════════════════════════════════
export default function AcceptRejectProposal({ onNavigate, params, role }) {
  const [decision, setDecision] = useState(null); // "accepted" | "rejected" | null

  const bidId = params?.bidId;
  const jobId = params?.jobId;

  const { bid, loading: bidLoading, error: bidError } = useBid(bidId);
  const { acceptBid, loading: accepting, error: acceptError } = useAcceptBid();
  const { rejectBid, loading: rejecting, error: rejectError } = useRejectBid();

  if (bidLoading) return <div className="py-20 text-center font-black uppercase tracking-widest text-slate-300 italic">Synchronizing Proposal Data...</div>;
  if (bidError || !bid) return <div className="py-20 text-center text-error font-black uppercase tracking-widest">Protocol Error: {bidError || "Proposal not found"}</div>;

  const TIMELINE = [
    { event: "Proposal submitted",  date: new Date(bid.submitted_at).toLocaleDateString(),  active: false },
    { event: "Client viewed",       date: "Recent",  active: false },
    { event: "Awaiting decision",   date: "Today",   active: bid.status === 'pending'  },
  ];

  const currentStatus = decision || bid.status;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-outline-variant/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button onClick={() => onNavigate("jobproposals", { jobId })} className="hover:text-primary transition-colors">Proposals List</button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">Proposal Review</span>
          </div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tight">Proposal Evaluation</h1>
        </div>
        
        <div className="flex gap-4">
           <Btn variant="outlined" onClick={() => onNavigate("jobproposals", { jobId })}>Cancel Review</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 space-y-12">
          {/* Summary Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Project Focus", value: bid.job?.title || "Editorial Service", icon: "terminal" },
                { label: "Agreed Capital", value: `PKR ${bid.bid_amount}`, icon: "payments", highlight: true },
                { label: "Submission Date", value: new Date(bid.submitted_at).toLocaleDateString(), icon: "calendar_today" },
                { label: "Verification", value: currentStatus, icon: "verified_user" },
              ].map(({ label, value, icon, highlight }) => (
                <div key={label} className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </div>
                  {label === "Verification" ? (
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-outline-variant/10 ${value === 'accepted' ? 'bg-primary text-on-primary' : value === 'rejected' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-primary'}`}>
                      {value}
                    </span>
                  ) : (
                    <div className={`text-lg font-black uppercase tracking-tight ${highlight ? 'text-primary' : 'text-slate-600'}`}>{value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Breakdown */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Milestone Strategy</h3>
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/50 border-b border-outline-variant/10">
                    {["Milestone Detail", "Execution Phase", "Capital Allocation", "Status"].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {(Array.isArray(bid.milestones) && bid.milestones.length > 0 ? bid.milestones : MILESTONES).map((m, i) => (
                    <tr key={i} className="hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-5 font-black text-primary text-sm uppercase">{m.title}</td>
                      <td className="px-6 py-5 text-xs font-medium text-slate-500 italic">{m.due}</td>
                      <td className="px-6 py-5 font-black text-primary text-sm">{m.budget}</td>
                      <td className="px-6 py-5">
                        <MilestoneBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Executive Summary</h3>
            <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 relative">
              <span className="material-symbols-outlined absolute -top-4 -left-4 text-6xl text-primary/10 select-none">format_quote</span>
              <p className="text-slate-600 leading-loose font-medium italic relative z-10 whitespace-pre-wrap">
                {bid.cover_letter}
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          {/* Decision Card */}
          <div className="bg-surface-container-lowest border-2 border-primary rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg border-2 ${currentStatus === "accepted" ? "bg-primary text-on-primary border-primary" : currentStatus === "rejected" ? "bg-error-container text-on-error-container border-error" : "bg-surface-container border-outline-variant animate-pulse"}`}>
                  {currentStatus === "accepted" ? "check_circle" : currentStatus === "rejected" ? "cancel" : "pending"}
                  <span className="material-symbols-outlined text-4xl">{currentStatus === "accepted" ? "check_circle" : currentStatus === "rejected" ? "cancel" : "hourglass_empty"}</span>
                </div>
                <div className="space-y-1">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Current Protocol</h3>
                   <div className="text-2xl font-black text-primary uppercase tracking-tighter">{currentStatus}</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorization Required</p>
                <div className="flex flex-col gap-3">
                  <Btn
                    className="w-full h-14 text-sm"
                    onClick={async () => {
                      const ok = await acceptBid(bidId, jobId);
                      if (ok) setDecision("accepted");
                    }}
                    disabled={accepting || rejecting || currentStatus !== "pending"}
                  >
                    {accepting ? "Initiating Contract…" : "Confirm Acceptance"}
                  </Btn>

                  <Btn
                    variant="outlined"
                    className="w-full h-12"
                    onClick={async () => {
                      const ok = await rejectBid(bidId);
                      if (ok) setDecision("rejected");
                    }}
                    disabled={accepting || rejecting || currentStatus !== "pending"}
                  >
                    {rejecting ? "Processing Rejection…" : "Decline Proposal"}
                  </Btn>
                </div>
                
                {acceptError || rejectError && (
                  <p className="text-[10px] font-bold text-error uppercase text-center">{acceptError || rejectError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-surface-container-high/50 border border-outline-variant/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest">Interaction Log</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/20">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${item.active ? 'bg-primary border-primary' : 'bg-surface-container-lowest border-outline-variant'}`}>
                     {item.active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-black uppercase tracking-tight ${item.active ? 'text-primary' : 'text-slate-400'}`}>{item.event}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
