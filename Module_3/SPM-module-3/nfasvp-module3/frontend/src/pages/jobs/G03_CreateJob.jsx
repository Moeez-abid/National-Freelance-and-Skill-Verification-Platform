import { useState } from "react";
import { C, Navbar, Btn } from "../gigs/shared";
import { usePostJob } from "../../hooks/useJobs";
import { useCategories } from "../../hooks/useCategories";

export default function CreateJob({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [projectType, setProjectType] = useState("fixed_price");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const { postJob, loading } = usePostJob();
  const { categories } = useCategories();

  const handlePublish = async () => {
    const minBudget = Number(budgetMin || 0);
    const maxBudget = Number(budgetMax);

    if (!title || !category || !budgetMax) {
      alert("Please fill in Title, Category, and Budget.");
      return;
    }
    if (!Number.isFinite(maxBudget) || maxBudget <= 0 || minBudget < 0 || minBudget > maxBudget) {
      alert("Please enter a valid budget range. Max budget must be greater than 0 and at least the min budget.");
      return;
    }

    // Generate a deadline 30 days from now to satisfy the backend 'expires_at' validation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      await postJob({
        title,
        description: description || "No description provided.",
        category_id: category,
        project_type: projectType,
        budget_min: minBudget,
        budget_max: maxBudget,
        expires_at: expiresAt.toISOString(),
        // Omitting required_skills because the backend expects UUIDs from the tags table
      });
      onNavigate("myjobs");
    } catch (e) {
      alert(e.message || "Failed to post job. Make sure the backend is running and your inputs are valid.");
    }
  };

  const STEPS = ["Overview", "Budget", "Description", "Publish"];

  const fieldStyle = {
    width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`,
    borderRadius: 4, fontSize: 14, color: C.textPrimary, background: C.white,
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: C.textSecondary, letterSpacing: "0.8px",
    textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>
          
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, color: C.black, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.8px" }}>Post a New Job</h1>
            <p style={{ margin: 0, fontSize: 15, color: C.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>Find top freelancers for your project</p>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setStep(i + 1)}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 15,
                    background: step === i + 1 ? C.black : step > i + 1 ? "#10B981" : "#F1F5F9",
                    border: step >= i + 1 ? "none" : `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: step >= i + 1 ? C.white : "#94A3B8",
                    fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: step === i + 1 ? C.black : "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: "#E2E8F0", margin: "0 12px" }} />}
              </div>
            ))}
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>Job Details</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>JOB TITLE</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g. Build a React Dashboard' style={fieldStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>CATEGORY</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...fieldStyle }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PROJECT TYPE</label>
                <select value={projectType} onChange={e => setProjectType(e.target.value)} style={{ ...fieldStyle }}>
                  <option value="fixed_price">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>MIN BUDGET ($)</label>
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="e.g. 500" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>MAX BUDGET ($)</label>
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="e.g. 1500" style={fieldStyle} />
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>Description</h3>
              <label style={labelStyle}>JOB DESCRIPTION</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your project, timeline, and requirements in detail."
                rows={5}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
            <Btn variant="ghost" onClick={() => onNavigate("browsejobs")}>Cancel</Btn>
            <Btn onClick={handlePublish} disabled={loading}>{loading ? "Publishing..." : "Publish Job"}</Btn>
          </div>

        </div>
      </div>
    </div>
  );
}
