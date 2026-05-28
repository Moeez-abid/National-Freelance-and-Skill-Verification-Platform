import { useState } from "react";
import { C, Navbar, StickyNote, Btn } from "../gigs/shared";
import { useProject, useUpdateProjectStatus } from "../../hooks/useProjects";

// ══════════════════════════════════════════════════════════════════════════════
// G03_ProjectDetail (Screen 22)
// ══════════════════════════════════════════════════════════════════════════════
export default function ProjectDetail({ onNavigate, params, role }) {
  const { project, loading, error, refresh } = useProject(params?.id);
  const { updateStatus, loading: updating } = useUpdateProjectStatus();
  const [activeTab, setActiveTab] = useState("Milestones");

  if (loading) return <div style={{ padding: 100, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading project details...</div>;
  if (error || !project) return (
    <div style={{ padding: 100, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <h2 style={{ color: "red" }}>{error || "Project not found"}</h2>
      <Btn onClick={() => onNavigate("myprojects")} style={{ marginTop: 20 }}>Back to Projects</Btn>
    </div>
  );

  const statusColors = {
    pending:   { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
    active:    { bg: "#DBEAFE", text: "#1E40AF", label: "In Progress" },
    completed: { bg: "#D1FAE5", text: "#065F46", label: "Completed" },
  };
  const st = statusColors[project.status] || statusColors.pending;

  const handleStatusUpdate = async (newStatus) => {
    if (window.confirm(`Are you sure you want to mark this project as ${newStatus}?`)) {
      const success = await updateStatus(project.id, newStatus);
      if (success) {
        alert("Status updated!");
        refresh();
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted }}>
            <span onClick={() => onNavigate("myprojects")} style={{ cursor: "pointer", textDecoration: "underline" }}>My Projects</span>
            <span>›</span>
            <span>Project Details</span>
          </div>

          {/* Header Card */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, background: "#F1F5F9", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {project.type === 'gig' ? '💼' : '🛠️'}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.black }}>{project.title || "Project Title"}</h1>
                  <span style={{ background: st.bg, color: st.text, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{st.label}</span>
                </div>
                <div style={{ display: "flex", gap: 16, color: C.textSecondary, fontSize: 14 }}>
                  <span>Partner: <strong>{project.partner_name || 'User'}</strong></span>
                  <span>Budget: <strong>PKR {project.total_budget || project.amount}</strong></span>
                  <span>Deadline: <strong>{project.deadline || 'Not set'}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {project.status === 'active' && role === 'client' && (
                <Btn onClick={() => handleStatusUpdate('completed')} disabled={updating}>Complete Project</Btn>
              )}
              <Btn variant="outlined">Message Partner</Btn>
            </div>
          </div>

          {/* Content Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Tab Nav */}
              <div style={{ borderBottom: `1px solid ${C.border}`, display: "flex", gap: 32 }}>
                {["Milestones", "Files & Deliverables", "Communication"].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    background: "none", border: "none", paddingBottom: 12, cursor: "pointer",
                    fontSize: 15, fontWeight: activeTab === t ? 700 : 500,
                    color: activeTab === t ? C.black : C.textMuted,
                    borderBottom: activeTab === t ? `2px solid ${C.black}` : "2px solid transparent",
                    marginBottom: -1
                  }}>{t}</button>
                ))}
              </div>

              {/* Tab Content: Milestones */}
              {activeTab === "Milestones" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {(project.milestones || []).length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", background: "#F9FAFB", borderRadius: 8, color: C.textMuted, fontSize: 14, border: `1px dashed ${C.border}` }}>
                      No milestones defined for this project yet.
                    </div>
                  ) : (
                    project.milestones.map((m, i) => (
                      <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.status === 'completed' ? "#10B981" : "#E2E8F0", color: m.status === 'completed' ? C.white : C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                            {m.status === 'completed' ? '✓' : i + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>{m.title}</div>
                            <div style={{ fontSize: 13, color: C.textMuted }}>{m.description}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.black }}>PKR {m.amount}</div>
                          <div style={{ fontSize: 12, color: m.status === 'completed' ? "#059669" : "#64748B", fontWeight: 600 }}>{m.status === 'completed' ? "RELEASED" : "ESCROWED"}</div>
                        </div>
                      </div>
                    ))
                  )}
                  {role === 'client' && project.status === 'active' && (
                    <Btn variant="outlined" style={{ alignSelf: "center", marginTop: 10 }}>+ Add Milestone</Btn>
                  )}
                </div>
              )}

              {activeTab !== "Milestones" && (
                <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>
                  Integration with Files/Messaging modules (G04/G06) would appear here.
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Repository Link</h3>
                {project.git_repo ? (
                  <div style={{ background: "#F1F5F9", padding: "10px 14px", borderRadius: 6, fontSize: 13, fontFamily: "monospace", color: "#334155", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {project.git_repo}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>No repository linked yet.</p>
                    {role === 'freelancer' && (
                      <Btn small variant="outlined">Connect GitHub Repo</Btn>
                    )}
                  </div>
                )}
              </div>

              <div style={{ background: "#0F172A", color: "#fff", borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>Module 3 Compliance</h3>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>
                  This screen tracks project progression and ensures all deliverables are validated through the SPM-3 status management logic.
                </p>
              </div>

              <StickyNote text="🔗 Milestones → G07 Payments Integration · Message Partner → G06 Communications Module" />
            </aside>

          </div>

        </div>
      </main>
    </div>
  );
}
