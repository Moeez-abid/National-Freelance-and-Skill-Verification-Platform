import { useState, useMemo } from "react";
import { C, Navbar, Sidebar, StatusBadge, Btn } from "./fbs_shared";
import { useMyProposals } from "../../hooks/useBids";

export default function MyProposals({ onNavigate, role }) {
  const [activeTab, setActiveTab] = useState("All");
  const TABS = ["All", "Pending", "Accepted", "Rejected", "Withdrawn"];

  const apiStatusFilter = activeTab === "All" ? "" : activeTab.toLowerCase();
  const { bids, loading, error, meta } = useMyProposals(apiStatusFilter ? { status: apiStatusFilter } : {});

  const mappedProposals = useMemo(() => {
    if (!bids) return [];
    return bids.map(b => ({
      id: b.id,
      job: b.job?.title || "Unknown Job",
      client: `Client ${b.job?.client_id?.substring(0, 4) || ''}`,
      amount: `PKR ${b.bid_amount}`,
      date: new Date(b.submitted_at || b.created_at).toLocaleDateString(),
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1)
    }));
  }, [bids]);

  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    if (!bids && activeTab !== "All") return { pending: "-", accepted: "-", rejected: "-" };
    // Note: If we are on a filtered tab, these counts only represent the filtered subset.
    // In a real app, you'd fetch these counts separately.
    return {
      total: meta?.total || 0,
      pending: bids?.filter(b => b.status === 'pending').length || 0,
      accepted: bids?.filter(b => b.status === 'accepted').length || 0,
      rejected: bids?.filter(b => b.status === 'rejected').length || 0,
    };
  }, [bids, meta, activeTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar activeLink="proposals" onNavigate={onNavigate} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeKey="proposals" onNavigate={onNavigate} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 700, color: C.navy, fontFamily: "'Manrope', sans-serif" }}>My Proposals</h1>
            <p style={{ margin: 0, fontSize: 16, color: C.textBody }}>Review and track all your active submitted job bids</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
            {[
              { label: "Total Submitted", value: stats.total, color: C.navy },
              { label: "Pending Review", value: stats.pending, color: "#D97706" },
              { label: "Accepted", value: stats.accepted, color: "#0D9488" },
              { label: "Rejected", value: stats.rejected, color: "#DC2626" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#F8FAFC", border: "1px solid rgba(196,198,208,0.4)",
                borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 8,
              }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: "#747780" }}>{s.label}</span>
                <span style={{ fontWeight: 800, fontSize: 36, color: s.color, fontFamily: "'Manrope', sans-serif" }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "16px 32px", border: "none", cursor: "pointer",
                background: "transparent", fontSize: 16,
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? C.navy : "#747780",
                borderBottom: activeTab === tab ? `2px solid ${C.tealDark}` : "2px solid transparent",
                marginBottom: -1,
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, overflowX: "auto" }}>
            <div style={{ minWidth: 900 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.3fr 1.3fr 1fr", background: "#F1F5F9" }}>
                {["JOB TITLE", "CLIENT", "BID AMOUNT", "SUBMITTED", "STATUS", "ACTION"].map((h, i) => (
                  <div key={h} style={{ padding: "20px 32px", fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: "1px" }}>{h}</div>
                ))}
              </div>

              {loading ? <div style={{ padding: 40, textAlign: "center" }}>Loading...</div> : mappedProposals.map((p, idx) => (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.3fr 1.3fr 1fr",
                  borderTop: `1px solid ${C.border}`, alignItems: "center",
                }}>
                  <div style={{ padding: "24px 32px", fontWeight: 700, color: C.navy }}>{p.job}</div>
                  <div style={{ padding: "24px 32px" }}>{p.client}</div>
                  <div style={{ padding: "24px 32px", fontWeight: 900 }}>{p.amount}</div>
                  <div style={{ padding: "24px 32px" }}>{p.date}</div>
                  <div style={{ padding: "24px 32px" }}><StatusBadge status={p.status} /></div>
                  <div style={{ padding: "24px 32px", textAlign: "right" }}>
                    <Btn variant="outlined" small onClick={() => onNavigate("review")}>View</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
