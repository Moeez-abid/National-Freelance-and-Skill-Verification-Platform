import { useState, useMemo, useEffect } from "react";
import { C, Navbar, Sidebar, Btn, MILESTONES } from "./fbs_shared";
import { useSubmitBid } from "../../hooks/useBids";
import { useJob } from "../../hooks/useJobs";

// ══════════════════════════════════════════════════════════════════════════════
// 09 - Submit Proposal
// ══════════════════════════════════════════════════════════════════════════════
export default function SubmitProposal({ onNavigate, params }) {
  const [bidAmount, setBidAmount] = useState("2000");
  const [duration, setDuration] = useState("2 months");
  const [bidType, setBidType] = useState("fixed_price");
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState(MILESTONES.map((m, i) => ({ ...m, id: i })));
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  
  // API integration
  const { submitBid, loading: submitting, error: submitError } = useSubmitBid();
  const { job, loading: jobLoading } = useJob(params?.jobId);
  const targetJobId = params?.jobId;

  // Sync bidAmount with totalMilestoneBudget if milestones exist
  const totalMilestoneBudget = useMemo(() => {
    return milestones.reduce((sum, m) => {
      const val = parseInt(m.budget.toString().replace(/\D/g, ""), 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [milestones]);

  useEffect(() => {
    if (milestones.length > 0) {
      setBidAmount(totalMilestoneBudget.toString());
    }
  }, [totalMilestoneBudget, milestones.length]);

  const addMilestone = () => {
    if (!newTitle) {
      alert("Please enter a milestone title.");
      return;
    }
    const amt = parseInt(newAmount.replace(/\D/g, ""), 10);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount for the milestone.");
      return;
    }

    setMilestones([...milestones, { 
      id: Date.now(), 
      title: newTitle, 
      due: newDate || "TBD", 
      budget: `$${amt.toLocaleString()}`, 
      status: "Pending" 
    }]);
    setNewTitle(""); setNewDate(""); setNewAmount("");
  };
  const removeMilestone = (id) => setMilestones(milestones.filter(m => m.id !== id));

  const fieldStyle = {
    width: "100%", height: 44, padding: "0 12px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.textBody, background: C.white,
    fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none",
  };
  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: C.navy,
    fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 6,
  };
  const sectionHeadStyle = {
    display: "flex", alignItems: "center", gap: 8, paddingBottom: 4,
    borderBottom: `1px solid ${C.border}`, marginBottom: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#FBF9FC" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar activeLink="jobs" onNavigate={onNavigate} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeItem="jobs" onNavigate={onNavigate} />

        {/* Main — centered single column */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 0 120px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 720, padding: "0 24px" }}>

            {/* Breadcrumb + Title */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span onClick={() => onNavigate("browsejobs")} style={{ fontSize: 11, color: "#747780", cursor: "pointer", textDecoration: "underline" }}>Browse Jobs</span>
                <span style={{ color: "#747780", fontSize: 11 }}>›</span>
                <span onClick={() => onNavigate("jobdetail", { id: targetJobId })} style={{ fontSize: 11, color: "#747780", cursor: "pointer", textDecoration: "underline" }}>Job Detail</span>
                <span style={{ color: "#747780", fontSize: 11 }}>›</span>
                <span style={{ fontSize: 11, color: C.navy, fontWeight: 600 }}>Submit Proposal</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Submit a Proposal</h1>
            </div>

            {/* Job Reference Card */}
            <div style={{ background: C.bgSidebar, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>Applying for:</div>
                <div style={{ fontSize: 16, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>
                  {jobLoading ? "Loading..." : job?.title || "Unknown Job"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>Budget</div>
                <div style={{ fontSize: 16, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>
                  {jobLoading ? "..." : (job?.budget_max ? `$${job.budget_max}` : `$${job?.budget_min || 0}`)}
                </div>
              </div>
            </div>

            {/* ── Section 1: Your Bid ── */}
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>
                <span style={{ fontSize: 13, color: C.navy }}>💰</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Your Bid</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Bid Amount ($)</label>
                  <input value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                    placeholder="Enter your bid" style={fieldStyle} />
                  <span style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif", marginTop: 4, display: "block" }}>Client's budget: $2,000</span>
                </div>
                <div>
                  <label style={labelStyle}>Project Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} style={{ ...fieldStyle }}>
                    {["1 week", "2 weeks", "Less than 1 month", "1–3 months", "3–6 months", "6+ months"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {/* Bid Type */}
              <div>
                <label style={labelStyle}>Bid Type</label>
                <div style={{ display: "flex", gap: 24 }}>
                  {[["fixed_price", "Fixed Price"], ["hourly", "Hourly Rate"]].map(([val, label]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.textDark }}>
                      <input type="radio" name="bidType" value={val} checked={bidType === val} onChange={() => setBidType(val)}
                        style={{ accentColor: C.navy, width: 16, height: 16 }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 2: Cover Letter ── */}
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>
                <span style={{ fontSize: 13, color: C.navy }}>✉️</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Cover Letter</span>
              </div>
              <div style={{ position: "relative" }}>
                <textarea
                  value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                  rows={6}
                  style={{ width: "100%", padding: 12, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.textBody, fontFamily: "'Inter', sans-serif", resize: "vertical", boxSizing: "border-box", outline: "none" }}
                />
                <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10, color: "#747780", fontFamily: "'Inter', sans-serif" }}>
                  {coverLetter.length} / 2000
                </span>
              </div>
            </div>

            {/* ── Section 3: Milestone Plan ── */}
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>
                <span style={{ fontSize: 13, color: C.navy }}>📅</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Milestone Plan</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Break down your delivery plan into milestones</p>

              {/* Add Milestone Row */}
              <div style={{ overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center", minWidth: 400 }}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="Milestone Title" style={{ ...fieldStyle, height: 32, fontSize: 12 }} />
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ ...fieldStyle, width: 120, height: 32, fontSize: 12 }} />
                <input value={newAmount} onChange={e => setNewAmount(e.target.value)}
                  placeholder="$" style={{ ...fieldStyle, width: 72, height: 32, fontSize: 12 }} />
                <button onClick={addMilestone} style={{
                  height: 32, padding: "0 16px", background: C.white, border: `1px solid ${C.navy}`,
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.navy,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4,
                }}>+ Add</button>
                </div>
              </div>

              {/* Milestone List */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                {milestones.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderBottom: i < milestones.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#64748B", fontFamily: "'Inter', sans-serif" }}>{i + 1}</div>
                      <span style={{ fontSize: 14, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{m.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Due: {m.due}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{m.budget}</span>
                      <button onClick={() => removeMilestone(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: 14, padding: 0 }}>✕</button>
                    </div>
                  </div>
                ))}
                {/* Total */}
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 10px", borderTop: `1px solid ${C.border}`, background: "#F9FAFB" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>Total: ${totalMilestoneBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ── Section 4: Attachments ── */}
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>
                <span style={{ fontSize: 13, color: C.navy }}>📎</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Attachments</span>
              </div>
              <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, background: C.white, height: 91, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                <span style={{ fontSize: 18, color: "#747780" }}>📁</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>Drag files or click to upload</span>
                <span style={{ fontSize: 10, color: "#747780", fontFamily: "'Inter', sans-serif" }}>PDF, DOC, ZIP up to 10MB</span>
              </div>
            </div>

            {/* ── Form Actions ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, padding: "16px 0" }}>
              <Btn variant="ghost" onClick={() => onNavigate("jobdetail")} style={{ fontSize: 14 }}>Cancel</Btn>
              {submitError && (
                <span style={{ fontSize: 12, color: "#DC2626", fontFamily: "'Inter', sans-serif" }}>{submitError}</span>
              )}
              <Btn
                onClick={async () => {
                  if (!targetJobId) {
                    alert("No job selected to submit a proposal for.");
                    return;
                  }
                  if (!coverLetter.trim()) {
                    alert("Cover letter is required.");
                    return;
                  }
                  const finalBidAmount = bidType === "Milestones" ? totalMilestoneBudget : (parseFloat(bidAmount) || 0);
                  
                  if (finalBidAmount <= 0) {
                    alert("Please enter a bid amount or add milestones with budgets.");
                    return;
                  }

                  const result = await submitBid(targetJobId, {
                    bid_amount: finalBidAmount,
                    cover_letter: coverLetter,
                    duration_label: duration,
                    bid_type: "fixed_price", // Enum project_type only allows 'fixed_price' or 'hourly'
                    milestones: milestones
                  });
                  if (result) onNavigate("myproposals");
                }}
                style={{ height: 40, padding: "0 32px", fontSize: 14, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Submitting…" : "Submit Proposal →"}
              </Btn>
            </div>

            {/* Spacer to prevent fixed footer overlap */}
            <div style={{ height: 120, flexShrink: 0 }} />
          </div>
        </main>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 240, right: 0, minHeight: 80, padding: "16px 0", background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
        <div style={{ maxWidth: 800, width: "100%", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Draft saved automatically</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif", cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>
            <span style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
