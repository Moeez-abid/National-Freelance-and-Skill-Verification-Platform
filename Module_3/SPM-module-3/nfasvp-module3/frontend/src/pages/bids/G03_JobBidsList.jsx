import { useState, useEffect } from "react";
import { C, Navbar, Sidebar, Btn, MilestoneBadge } from "./fbs_shared";
import { useJobBids } from "../../hooks/useBids";
import { useJob } from "../../hooks/useJobs";

export default function JobBidsList({ onNavigate, params, role }) {
  const jobId = params?.jobId;
  const { job } = useJob(jobId);
  const { bids, loading, error, refresh } = useJobBids(jobId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#FBF9FC" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar activeLink="jobs" onNavigate={onNavigate} role={role} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeItem="jobs" onNavigate={onNavigate} role={role} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span onClick={() => onNavigate("myjobs")} style={{ fontSize: 11, color: "#747780", cursor: "pointer", textDecoration: "underline" }}>My Jobs</span>
                <span style={{ color: "#747780", fontSize: 11 }}>›</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Proposals on Job</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>
                Proposals for "{job?.title || "..."}"
              </h1>
              <p style={{ margin: "8px 0 0", color: "#747780", fontSize: 14 }}>
                Review and accept proposals from freelancers.
              </p>
            </div>

            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: C.navy }}>Loading proposals...</div>
            ) : error ? (
              <div style={{ padding: 60, textAlign: "center", color: "red" }}>Error: {error}</div>
            ) : bids.length === 0 ? (
              <div style={{ padding: 80, textAlign: "center", background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📩</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 20, color: C.navy }}>No proposals yet</h3>
                <p style={{ margin: "0 0 24px", color: "#747780" }}>Wait for freelancers to submit their bids on your job.</p>
                <Btn variant="outlined" onClick={() => onNavigate("myjobs")}>Back to My Jobs</Btn>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {bids.map(bid => (
                  <div key={bid.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👨‍💻</div>
                        <div>
                          <div style={{ fontWeight: 700, color: C.navy, fontSize: 16 }}>Freelancer ID: {bid.freelancer_id.substring(0, 8)}...</div>
                          <div style={{ fontSize: 12, color: "#747780" }}>Submitted {new Date(bid.submitted_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 24, fontSize: 14, color: C.textBody }}>
                        <span>Bid Amount: <strong style={{ color: C.tealDark }}>${bid.bid_amount}</strong></span>
                        <span>Duration: <strong>{bid.duration_label}</strong></span>
                        <span>Status: <strong style={{ textTransform: "uppercase", fontSize: 12 }}>{bid.status}</strong></span>
                      </div>
                      <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748B", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {bid.cover_letter}
                      </p>
                    </div>
                    <div style={{ marginLeft: 24 }}>
                      <Btn onClick={() => onNavigate("acceptreject", { bidId: bid.id, jobId: jobId })}>Review & Action</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
