import { useEffect, useState } from "react";
import { getC, Navbar, StickyNote, Btn } from "../gigs/shared";
import { bidApi, gigApi, jobApi, projectApi } from "../../services/api";

function NotificationItem({ item, onOpen }) {
  const C = getC();
  return (
    <div onClick={() => onOpen(item)} style={{
      padding: "16px 20px",
      borderBottom: `1px solid ${C.border}`,
      background: item.unread ? "#F8FAFF" : C.white,
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      cursor: "pointer"
    }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: item.unread ? 700 : 500, color: C.textPrimary }}>{item.title}</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>{item.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{item.message}</p>
      </div>
      {item.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", marginTop: 6 }} />}
    </div>
  );
}

export default function Notifications({ onNavigate, role, currentUser, onMetricsChange }) {
  const C = getC();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const storageKey = `m3_read_notifications_${currentUser?.id || role}`;

  useEffect(() => {
    try {
      setReadIds(new Set(JSON.parse(localStorage.getItem(storageKey) || "[]")));
    } catch {
      setReadIds(new Set());
    }
  }, [storageKey]);

  function persistReadIds(nextSet) {
    setReadIds(nextSet);
    localStorage.setItem(storageKey, JSON.stringify([...nextSet]));
  }

  function markOneAsRead(id) {
    const next = new Set(readIds);
    next.add(id);
    persistReadIds(next);
    onMetricsChange?.((prev) => ({
      ...(typeof prev === "object" && prev ? prev : {}),
      unread: Math.max(0, Number(prev?.unread || 0) - 1),
    }));
  }

  function markAllAsRead() {
    persistReadIds(new Set(notifications.map((item) => item.id)));
    onMetricsChange?.((prev) => ({ ...(typeof prev === "object" && prev ? prev : {}), unread: 0 }));
  }

  function openNotification(item) {
    markOneAsRead(item.id);
    if (item.target) onNavigate(item.target.screen, item.target.params || {});
  }

  useEffect(() => {
    let alive = true;

    async function loadNotifications() {
      setLoading(true);
      setError("");

      try {
        const projectRes = await projectApi.myProjects();
        const projects = projectRes.success ? (projectRes.data || []) : [];
        let items = projects.map((project) => ({
          id: `project-${project.id}`,
          title: project.status === "active" ? "Project Active" : "Project Update",
          message: `${project.title} is currently ${project.status}.`,
          time: "Project timeline",
          icon: "assignment",
          color: "#E0E7FF",
          unread: project.status === "active",
          target: { screen: "projectdetail", params: { id: project.id } },
        }));

        if (role === "client") {
          const jobsRes = await jobApi.dashboard();
          const jobs = jobsRes.success ? (jobsRes.data || []) : [];
          items = items.concat(jobs.flatMap((job) => {
            const bidCount = Number(job.bids_count || 0);
            return [
              bidCount > 0 && {
                id: `job-bids-${job.id}`,
                title: "New Proposals Received",
                message: `${bidCount} proposal${bidCount === 1 ? "" : "s"} submitted for "${job.title}".`,
                time: "Review queue",
                icon: "description",
                color: "#DBEAFE",
                unread: job.status === "open",
                target: { screen: "jobbids", params: { jobId: job.id, id: job.id } },
              },
              job.status === "in_progress" && {
                id: `job-progress-${job.id}`,
                title: "Job In Progress",
                message: `"${job.title}" has moved into project delivery.`,
                time: "Active",
                icon: "rocket_launch",
                color: "#D1FAE5",
                unread: true,
                target: { screen: "jobdetail", params: { id: job.id } },
              },
            ].filter(Boolean);
          }));
        } else {
          const [gigsRes, bidsRes] = await Promise.all([gigApi.myGigs(), bidApi.myBids()]);
          const gigs = gigsRes.success ? (gigsRes.data || []) : [];
          const bids = bidsRes.success ? (bidsRes.data || []) : [];
          items = items.concat(
            gigs.filter((gig) => gig.status === "live").map((gig) => ({
              id: `gig-${gig.id}`,
              title: gig.is_featured ? "Gig Featured" : "Gig Live",
              message: `"${gig.title}" is visible to clients.`,
              time: "Marketplace",
              icon: gig.is_featured ? "star" : "storefront",
              color: gig.is_featured ? "#FFEDD5" : "#DBEAFE",
              unread: !!gig.is_featured,
              target: { screen: "detail", params: { id: gig.id } },
            })),
            bids.filter((bid) => bid.status !== "pending").map((bid) => ({
              id: `bid-${bid.id}`,
              title: bid.status === "accepted" ? "Proposal Accepted" : "Proposal Updated",
              message: `Your proposal for "${bid.job?.title || "a job"}" is ${bid.status}.`,
              time: "Proposal status",
              icon: bid.status === "accepted" ? "check_circle" : "cancel",
              color: bid.status === "accepted" ? "#D1FAE5" : "#FEE2E2",
              unread: true,
              target: { screen: "jobdetail", params: { id: bid.job_id || bid.job?.id } },
            }))
          );
        }

        if (alive) setNotifications(items);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadNotifications();
    return () => { alive = false; };
  }, [role, currentUser?.id]);

  const enrichedNotifications = notifications.map((item) => ({
    ...item,
    unread: item.unread && !readIds.has(item.id),
  }));
  const visibleNotifications = enrichedNotifications.filter((n) => filter === "all" || n.unread);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.black }}>Notifications</h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textMuted }}>{currentUser?.name || role}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setFilter("all")} style={{ background: filter === "all" ? "#F1F5F9" : "none", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: filter === "all" ? C.black : C.textMuted }}>All</button>
              <button onClick={() => setFilter("unread")} style={{ background: filter === "unread" ? "#F1F5F9" : "none", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: filter === "unread" ? C.black : C.textMuted }}>Unread</button>
            </div>
          </div>

          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading notifications...</div>
            ) : error ? (
              <div style={{ padding: 40, textAlign: "center", color: "#B91C1C" }}>{error}</div>
            ) : visibleNotifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>No notifications for this user yet.</div>
            ) : visibleNotifications.map((n) => <NotificationItem key={n.id} item={n} onOpen={openNotification} />)}
          </div>

          <div style={{ padding: 16, textAlign: "center", background: "#F9FAFB" }}>
            <Btn variant="ghost" small onClick={markAllAsRead}>Mark all as read</Btn>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "24px auto 0" }}>
          <StickyNote text={`Notifications are generated from ${currentUser?.name || role}'s jobs, gigs, bids, and projects.`} />
        </div>
      </main>
    </div>
  );
}
