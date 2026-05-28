import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "TOTAL JOBS POSTED", value: "124" },
  { label: "ACTIVE PROJECTS", value: "18" },
  { label: "PENDING BIDS", value: "42" },
];

const recentJobs = [
  { id: 1, title: "UX/UI Architecture Audit", status: "ACTIVE", budget: "$4,500" },
  { id: 2, title: "Backend Infrastructure Scalability", status: "PENDING", budget: "$12,000" },
  { id: 3, title: "System Documentation Refactor", status: "ACTIVE", budget: "$2,100" },
];

const activities = [
  { id: 1, text: "New bid received for System Documentation", time: "2 MINS AGO", active: true },
  { id: 2, text: "Contract signed by Alpha_Dev_01", time: "1 HOUR AGO", active: false },
  { id: 3, text: "Project API Integration milestone reached", time: "4 HOURS AGO", active: false },
  { id: 4, text: "Invoice #9822 generated", time: "YESTERDAY", active: false },
];

const navItems = [
  { label: "Overview", icon: "▦" },
  { label: "Analytics", icon: "▤" },
  { label: "Directory", icon: "▣" },
  { label: "Logs", icon: "▢" },
];

export default function ClientDashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">

        {/* LEFT SIDEBAR */}
        <aside
          className="w-56 flex-shrink-0 rounded-xl px-4 py-6 flex flex-col gap-6"
          style={{ backgroundColor: "#f0f3ff" }}
        >
          {/* Brand label */}
          <div className="px-3">
            <p
              className="text-sm font-bold text-[#001736] leading-none"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              STRUC_V1
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-widest text-[#43474f] mt-0.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              SYSTEM_ARCH
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                style={
                  activeNav === item.label
                    ? { backgroundColor: "#001736", color: "#ffffff" }
                    : { color: "#43474f" }
                }
                onMouseEnter={(e) => {
                  if (activeNav !== item.label) {
                    e.currentTarget.style.backgroundColor = "#e7eeff";
                    e.currentTarget.style.color = "#001736";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== item.label) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#43474f";
                  }
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="flex-1 min-w-0">

          {/* Page Header */}
          <div className="mb-8">
            <p
              className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              USER_SESSION: ACTIVE
            </p>
            <h1
              className="text-5xl font-black text-[#001736] uppercase tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              CLIENT DASHBOARD
            </h1>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 mb-10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex-1 rounded-xl px-6 py-5"
                style={{
                  backgroundColor: "#e7eeff",
                  borderLeft: i === 2 ? "4px solid #001736" : undefined,
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-5xl font-black text-[#001736]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Two-column row */}
          <div className="flex gap-8">

            {/* Recent Jobs List */}
            <div className="flex-1 min-w-0">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-2 mb-4">
                <p
                  className="text-xs font-black uppercase tracking-widest text-[#001736]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  RECENT JOBS LIST
                </p>
                <p
                  className="text-[10px] uppercase tracking-widest text-[#43474f]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  FILTER: DATE_DESC
                </p>
              </div>

              {/* Job rows */}
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-4"
                  style={{ borderBottom: "1px solid rgba(196,198,208,0.3)" }}
                >
                  {/* Left info */}
                  <div
                    className="pl-4"
                    style={{ borderLeft: "4px solid #001736" }}
                  >
                    <p
                      className="text-sm font-bold text-[#001736] mb-1"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {job.title}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-widest text-[#43474f]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      ■ STATUS: {job.status}&nbsp;&nbsp;&nbsp;BUDGET: {job.budget}
                    </p>
                  </div>

                  {/* View Details button — navigates to job detail */}
                  <button
                    onClick={() => navigate("/job-detail")}
                    className="flex-shrink-0 text-[10px] font-black uppercase px-4 py-2 rounded tracking-widest transition-all hover:opacity-90"
                    style={{ backgroundColor: "#001736", color: "#ffffff" }}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              ))}
            </div>

            {/* Right column — Quick Actions + Activity Stream */}
            <div className="w-56 flex-shrink-0">

              {/* Quick Actions */}
              <div className="mb-6">
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-3"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  QUICK ACTIONS
                </p>
                <button
                  onClick={() => navigate("/post-a-job")}
                  className="w-full text-[10px] font-black uppercase py-3 rounded tracking-widest transition-all mb-2 hover:opacity-90"
                  style={{ backgroundColor: "#001736", color: "#ffffff" }}
                >
                  + POST NEW JOB
                </button>
                <button
                  onClick={() => navigate("/my-jobs")}
                  className="w-full text-[10px] font-black uppercase py-3 rounded tracking-widest transition-all border"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#001736",
                    borderColor: "#c4c6d0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                >
                  VIEW ALL JOBS
                </button>
              </div>

              {/* Activity Stream */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-3"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  ACTIVITY STREAM
                </p>
                {activities.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 mb-4">
                    <span
                      className="text-sm mt-0.5 flex-shrink-0"
                      style={{ color: item.active ? "#001736" : "#c4c6d0" }}
                    >
                      ■
                    </span>
                    <div>
                      <p
                        className="text-xs font-medium text-[#001736] leading-snug mb-0.5"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.text}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-widest text-[#43474f]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}