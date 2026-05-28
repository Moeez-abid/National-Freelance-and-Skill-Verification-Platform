import { useState } from "react";
import { C, Navbar, StickyNote, Btn } from "../gigs/shared";

// ─── NOTIFICATION ITEM ──────────────────────────────────────────────────────
function NotificationItem({ item }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
        background: item.unread ? "#F8FAFF" : C.white,
        display: "flex", gap: 16, alignItems: "flex-start",
        transition: "background 0.2s",
        cursor: "pointer"
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {item.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: item.unread ? 700 : 500, color: C.textPrimary }}>{item.title}</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>{item.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{item.message}</p>
      </div>
      {item.unread && (
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", marginTop: 6 }} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// G03_Notifications (Screen 23)
// ══════════════════════════════════════════════════════════════════════════════
export default function Notifications({ onNavigate, role }) {
  const [filter, setFilter] = useState("all");

  const MOCK_NOTIFICATIONS = [
    { id: 1, title: "New Bid Received", message: "A freelancer has submitted a bid on your job 'React Web App'.", time: "2 mins ago", icon: "📄", color: "#DBEAFE", unread: true },
    { id: 2, title: "Payment Released", message: "Milestone #1 payment has been successfully released to your account.", time: "1 hour ago", icon: "💰", color: "#D1FAE5", unread: true },
    { id: 3, title: "Project Status Update", message: "The project 'Logo Design' has been marked as Completed.", time: "3 hours ago", icon: "✅", color: "#FEF3C7", unread: false },
    { id: 4, title: "Message from Freelancer", message: "Ahmed Raza sent you a message regarding the recent deliverable.", time: "5 hours ago", icon: "✉️", color: "#E0E7FF", unread: false },
    { id: 5, title: "Gig Featured", message: "Congratulations! Your gig 'Professional SEO' is now featured.", time: "Yesterday", icon: "⭐", color: "#FFEDD5", unread: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          
          {/* Header */}
          <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.black }}>Notifications</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setFilter("all")} style={{ background: filter === 'all' ? "#F1F5F9" : "none", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: filter === 'all' ? C.black : C.textMuted }}>All</button>
              <button onClick={() => setFilter("unread")} style={{ background: filter === 'unread' ? "#F1F5F9" : "none", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: filter === 'unread' ? C.black : C.textMuted }}>Unread</button>
            </div>
          </div>

          {/* List */}
          <div>
            {MOCK_NOTIFICATIONS.filter(n => filter === 'all' || n.unread).map(n => (
              <NotificationItem key={n.id} item={n} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: 16, textAlign: "center", background: "#F9FAFB" }}>
            <Btn variant="ghost" small>Mark all as read</Btn>
          </div>

        </div>

        <div style={{ maxWidth: 800, margin: "24px auto 0" }}>
           <StickyNote text="🔗 Notifications → Linked to G06 Messaging and G07 Payment modules. Backend integration pending." />
        </div>
      </main>
    </div>
  );
}
