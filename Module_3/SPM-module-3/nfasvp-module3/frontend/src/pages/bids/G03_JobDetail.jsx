import { useState, useEffect } from "react";
import { C, Navbar, Sidebar, SkillTag, Btn, SectionCard, SectionHeading, MilestoneBadge, MILESTONES } from "./fbs_shared";
import { useJob, useUpdateJob } from "../../hooks/useJobs";

// ══════════════════════════════════════════════════════════════════════════════
// 08 - Job Detail
// ══════════════════════════════════════════════════════════════════════════════
export default function JobDetail({ onNavigate, params, role }) {
  const [isEditing, setIsEditing] = useState(false);
  const { job, loading, error } = useJob(params?.id);
  const { updateJob, loading: saving } = useUpdateJob();

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDescription(job.description || "");
      setBudgetMin(job.budget_min || "");
      setBudgetMax(job.budget_max || "");
    }
  }, [job]);

  const handleSave = async () => {
    const ok = await updateJob(job.id, {
      title,
      description,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
    });
    if (ok) {
      setIsEditing(false);
      alert("Job updated successfully!");
    }
  };

  const REQUIREMENTS = [
    "5+ years of experience with React and modern JavaScript (ES6+) ecosystems",
    "Strong proficiency in TypeScript, state management (Redux/Zustand), and testing frameworks",
    "Experience building and consuming RESTful and GraphQL APIs at scale",
    "Proven track record with complex data visualization libraries such as D3.js or Recharts",
  ];

  const jobSkills = job ? (Array.isArray(job.required_skills) ? job.required_skills.map(s => typeof s === 'string' ? s : s.name || s.tag) : ["React", "TypeScript"]) : [];

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 14, color: C.textBody, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#FBF9FC" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar activeLink="jobs" onNavigate={onNavigate} role={role} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeItem="jobs" onNavigate={onNavigate} role={role} />

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", background: "#FBF9FC" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: C.navy, fontSize: 18, fontFamily: "'Manrope', sans-serif" }}>
              Loading job details...
            </div>
          ) : (error || !job) ? (
            <div style={{ padding: 60, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 48 }}>🔍</div>
              <h2 style={{ margin: 0, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>{error || "Job Not Found"}</h2>
              <p style={{ color: C.textBody, margin: 0, fontFamily: "'Inter', sans-serif" }}>Please select a job from the Browse Jobs page.</p>
              <Btn onClick={() => onNavigate("browsejobs")} style={{ marginTop: 12 }}>Browse Jobs</Btn>
            </div>
          ) : (
            <div style={{ maxWidth: 1200, padding: 24, display: "grid", gridTemplateColumns: "1fr 368px", gap: 24, alignItems: "start" }}>
              
              {/* ── LEFT COLUMN ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span onClick={() => onNavigate("browsejobs")} style={{ fontSize: 12, color: "#747780", cursor: "pointer", fontWeight: 500, textDecoration: "underline" }}>Browse Jobs</span>
                  <span style={{ color: "#747780", fontSize: 12 }}>›</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Job Detail</span>
                </div>

                {/* Job Header */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {isEditing ? (
                    <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyle, fontSize: 24, fontWeight: 700 }} />
                  ) : (
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.navy, fontFamily: "'Manrope', sans-serif", lineHeight: 1.3 }}>
                      {job.title}
                    </h1>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    {/* Client */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                        {job.client_id ? "CL" : "TC"}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: C.navy, fontFamily: "'Inter', sans-serif" }}>
                            Client {job.client_id?.substring(0, 4) || 'TechCorp Inc.'}
                          </span>
                          <span style={{ color: C.tealDark, fontSize: 13 }}>✓</span>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#747780", letterSpacing: "0.225px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>VERIFIED CLIENT</div>
                      </div>
                    </div>
                    <div style={{ width: 1, height: 24, background: C.border }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Posted</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 24, background: C.border }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Proposals</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{job.bids_count || 0} submitted</div>
                    </div>
                  </div>

                  {/* Skill Tags */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {jobSkills.map(s => <SkillTag key={s} label={s} />)}
                  </div>
                </div>

                {/* Project Overview */}
                <SectionCard>
                  <SectionHeading>Project Overview</SectionHeading>
                  {isEditing ? (
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} style={inputStyle} />
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: C.textBody, lineHeight: 1.65, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-wrap" }}>
                      {job.description || "No description provided."}
                    </p>
                  )}
                </SectionCard>

                {/* Requirements */}
                <SectionCard>
                  <SectionHeading>Requirements</SectionHeading>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {REQUIREMENTS.map((req, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#006A62", fontSize: 14, marginTop: 2, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: C.textBody, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{req}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Project Milestones */}
                <div>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>Project Milestones</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MILESTONES.map((m, i) => (
                      <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{m.title}</span>
                          <span style={{ fontSize: 11, color: "#747780", fontFamily: "'Inter', sans-serif" }}>Due: {m.due}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{m.budget}</span>
                          <MilestoneBadge status={m.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About the Client */}
                <SectionCard>
                  <SectionHeading>About the Client</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                    {[
                      { val: "4.8 ⭐", label: "RATING" },
                      { val: job.client_id ? "12" : "0", label: "PROJECTS POSTED" },
                      { val: "95%",   label: "HIRE RATE" },
                    ].map((stat, i) => (
                      <div key={i} style={{ padding: "0 16px", borderLeft: i > 0 ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 18, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{stat.val}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#747780", letterSpacing: "0.45px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* ── RIGHT COLUMN (Sticky Card) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 20 }}>

                {/* Pricing Card */}
                <SectionCard style={{ borderRadius: 12 }}>
                  {/* Budget */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#747780", letterSpacing: "0.9px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>TOTAL BUDGET</span>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                        <span>–</span>
                        <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 24, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>
                        {job.budget_max ? `$${job.budget_min || 0} – ${job.budget_max}` : `$${job.budget_min || 0}+`}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#747780", fontFamily: "'Inter', sans-serif" }}>
                      {job.project_type === 'hourly' ? "Hourly Project" : "Fixed Price Project"}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: "📋", label: "Fixed Price · 2 Months" },
                      { icon: "⏱", label: "Duration: 2 Months" },
                      { icon: "🎓", label: "Experience: Expert Level" },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, color: "#747780" }}>{d.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{d.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {role === "freelancer" && (
                      <Btn style={{ width: "100%", height: 44, justifyContent: "center" }} onClick={() => onNavigate("submit", { jobId: job.id })}>
                        Submit a Proposal
                      </Btn>
                    )}
                    {role === "client" && !isEditing && (
                      <Btn variant="outlined" style={{ width: "100%", height: 44, justifyContent: "center" }} onClick={() => onNavigate("jobproposals", { jobId: job.id })}>
                        View Bids on this Job
                      </Btn>
                    )}
                    {role === "client" && (
                      <Btn 
                        variant={isEditing ? "primary" : "outlined"} 
                        style={{ width: "100%", height: 44, justifyContent: "center" }}
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : isEditing ? "Save Job" : "Edit Job"}
                      </Btn>
                    )}
                    {isEditing && (
                      <Btn variant="ghost" style={{ width: "100%", height: 36, justifyContent: "center", fontSize: 12 }} onClick={() => setIsEditing(false)}>
                        Cancel Edits
                      </Btn>
                    )}
                    <Btn variant="ghost" style={{ width: "100%", height: 36, justifyContent: "center", fontSize: 12 }} onClick={() => onNavigate("browsejobs")}>
                      ← Back to Jobs
                    </Btn>
                  </div>
                </SectionCard>

                {/* Optimization Tip */}
                <div style={{ background: "rgba(129,246,232,0.2)", border: "1px solid rgba(129,246,232,0.4)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: C.tealDeep }}>💡</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.tealDeep, letterSpacing: "0.55px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>PRO TIP</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: C.tealDeep, lineHeight: 1.65, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                    Enterprise clients prioritize candidates with deep domain expertise. Highlight your dashboard experience in your cover letter to stand out.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
