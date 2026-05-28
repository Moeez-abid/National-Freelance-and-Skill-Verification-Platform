import { useState } from "react";
import { C, Navbar, StickyNote, Stars, Btn } from "./shared";
import { useMyGigs } from "../../hooks/useGigs";

// ─── MINI GIG CARD (FOR DASHBOARD) ──────────────────────────────────────────
function MyGigCard({ gig, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  
  const basicTier = gig.pricing_tiers?.[0] || {};
  const price = basicTier.price ? `PKR ${basicTier.price}` : "Price N/A";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
        padding: 16, display: "flex", gap: 16, alignItems: "center",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {/* Icon / Thumbnail */}
      <div style={{ width: 60, height: 60, background: "#F1F5F9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
        💻
      </div>

      {/* Info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
          {gig.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.black }}>{price}</span>
          <span style={{ color: C.border }}>|</span>
          <Stars rating={gig.avg_rating || "0.0"} count={gig.review_count || "0"} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn small variant="outlined" onClick={() => onNavigate("edit", { id: gig.id })}>Edit</Btn>
        <Btn small onClick={() => onNavigate("detail", { id: gig.id })}>View</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// G03_MyGigs
// ══════════════════════════════════════════════════════════════════════════════
export default function MyGigs({ onNavigate, role }) {
  const { gigs, loading, error, refresh } = useMyGigs();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: C.black, letterSpacing: "-1px" }}>My Gigs</h1>
              <p style={{ margin: "4px 0 0", color: C.textSecondary, fontSize: 15 }}>Manage your service offerings and track performance.</p>
            </div>
            <Btn onClick={() => onNavigate("create")}>+ Create New Gig</Btn>
          </div>

          {/* Stats Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Active Gigs", value: gigs?.length || 0, icon: "✅" },
              { label: "Total Orders", value: "24", icon: "📦" },
              { label: "Earnings", value: "PKR 45,000", icon: "💰" },
            ].map(s => (
              <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 700, color: C.textPrimary }}>Active Service Listings</h2>
            
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading your gigs...</div>
            ) : error ? (
              <div style={{ padding: 40, textAlign: "center", color: "red" }}>Error: {error}</div>
            ) : gigs.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", background: C.white, border: `1px dashed ${C.border}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 40 }}>📁</div>
                <p style={{ margin: 0, color: C.textMuted }}>You haven't created any gigs yet.</p>
                <Btn onClick={() => onNavigate("create")} variant="outlined">Create Your First Gig</Btn>
              </div>
            ) : (
              gigs.map(g => <MyGigCard key={g.id} gig={g} onNavigate={onNavigate} />)
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <StickyNote text="🔗 Create New Gig → G03_CreateGig · Edit → G03_EditGig · View → G03_GigDetail" />
          </div>

        </div>
      </main>
    </div>
  );
}
