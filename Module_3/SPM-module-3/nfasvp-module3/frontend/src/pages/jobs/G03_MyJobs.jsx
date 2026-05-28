import { useState } from "react";
import { C, Navbar, Btn } from "../gigs/shared";
import { useMyJobs } from "../../hooks/useJobs";

export default function MyJobs({ onNavigate, role }) {
  const [filter, setFilter] = useState("all");
  const { jobs, loading, error } = useMyJobs();

  const filteredJobs = jobs?.filter(j => {
    if (filter === "all") return true;
    return j.status === filter;
  }) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 800, color: C.black, letterSpacing: "-0.8px" }}>My Jobs</h1>
            <p style={{ margin: 0, fontSize: 15, color: C.textSecondary }}>Manage your posted jobs and review proposals</p>
          </div>
          <Btn onClick={() => onNavigate("createjob")}>Post a New Job</Btn>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["all", "open", "in_progress", "completed", "cancelled"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                background: filter === status ? C.black : C.white,
                color: filter === status ? C.white : C.textSecondary,
                boxShadow: filter === status ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                border: filter === status ? "none" : `1px solid ${C.borderLight}`
              }}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textSecondary }}>Loading your jobs...</div>
        ) : error ? (
          <div style={{ padding: 60, textAlign: "center", color: "red" }}>Error: {error}</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: 80, textAlign: "center", background: C.white, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, color: C.black }}>No jobs found</h3>
            <p style={{ margin: "0 0 24px", color: C.textSecondary }}>You haven't posted any jobs matching this filter.</p>
            <Btn onClick={() => onNavigate("createjob")}>Post a Job</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, color: C.black, fontWeight: 700 }}>{job.title}</h3>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: C.textSecondary }}>
                    <span>Budget: ${job.budget_min} - ${job.budget_max}</span>
                    <span>Type: {job.project_type}</span>
                    <span>Status: <span style={{ fontWeight: 600, color: job.status === "open" ? "#10B981" : C.textSecondary }}>{job.status}</span></span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Btn variant="outlined" onClick={() => onNavigate("jobdetail", { id: job.id })}>View / Edit</Btn>
                  <Btn onClick={() => onNavigate("jobproposals", { jobId: job.id })}>View Bids</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
