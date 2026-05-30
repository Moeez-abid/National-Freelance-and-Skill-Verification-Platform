import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "DASHBOARD", icon: "▦" },
  { label: "JOBS", icon: "✦" },
  { label: "BIDS", icon: "▤" },
  { label: "DRAFTS", icon: "✉" },
];

const stats = [
  { label: "TOTAL ACTIVE", value: "12", highlight: false },
  { label: "PENDING APPROVAL", value: "04", highlight: false },
  { label: "JOBS COMPLETED", value: "28", highlight: false },
  { label: "TOTAL BUDGET", value: "$42.8K", highlight: true },
];

const jobs = [
  { id: 1, title: "System_Architecture_Refactor", budget: "$4,500.00", status: "ACTIVE", deadline: "OCT_15_2024" },
  { id: 2, title: "Database_Migration_Layer_01", budget: "$12,000.00", status: "PENDING", deadline: "NOV_01_2024" },
  { id: 3, title: "Security_Protocol_Audit_09", budget: "$4,000.00", status: "ACTIVE", deadline: "OCT_30_2024" },
  { id: 4, title: "Frontend_Monolith_Decoupling", budget: "$18,000.00", status: "REVIEW", deadline: "DEC_15_2024" },
];

const statusStyles = {
  "ACTIVE": { backgroundColor: "#89f5e7", color: "#001736" },
  "PENDING": { backgroundColor: "#e7eeff", color: "#001736" },
  "REVIEW": { backgroundColor: "#f0f3ff", color: "#43474f" },
  "COMPLETED": { backgroundColor: "#001736", color: "#89f5e7" },
  "CANCELLED": { backgroundColor: "#ffdad6", color: "#93000a" },
};

const filterOptions = ["FILTER BY STATUS", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"];

export default function MyJobs() {
  const [activeNav, setActiveNav] = useState("JOBS");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("FILTER BY STATUS");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8 relative">

        {/* LEFT SIDEBAR */}
        <aside
          className="w-56 flex-shrink-0 rounded-xl px-4 py-6 flex flex-col gap-6"
          style={{ backgroundColor: "#f0f3ff" }}
        >
          {/* Brand */}
          <div className="px-3">
            <p
              className="text-sm font-bold text-[#001736] leading-none"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              ARCHITECT_01
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
                onClick={() => {
                  if (item.label === "DASHBOARD") { navigate("/client-dashboard"); return; }
                  setActiveNav(item.label);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
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

          {/* Breadcrumb */}
          <p
            className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            PROJECT_OVERVIEW / JOBS
          </p>

          {/* Page Heading */}
          <h1
            className="text-4xl font-black text-[#001736] uppercase tracking-tight mb-6"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            MY JOBS
          </h1>

          {/* Search + Filter Row */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex-1 flex items-center gap-2 rounded-lg px-4 py-2.5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #c4c6d0" }}
            >
              <span style={{ color: "#43474f" }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="text-sm w-full focus:outline-none bg-transparent"
                style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none w-48"
              style={{
                backgroundColor: "#f0f3ff",
                border: "1px solid #c4c6d0",
                color: "#43474f",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex-1 rounded-xl px-4 py-4"
                style={{ backgroundColor: stat.highlight ? "#001736" : "#e7eeff" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: stat.highlight ? "#89f5e7" : "#43474f",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    color: stat.highlight ? "#89f5e7" : "#001736",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="rounded-xl overflow-hidden shadow-sm mb-4">
            <div
              className="grid gap-4 px-6 py-3"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                backgroundColor: "#f0f3ff",
              }}
            >
              {["JOB TITLE", "BUDGET", "STATUS", "DEADLINE", "ACTIONS"].map((col) => (
                <p
                  key={col}
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                >
                  {col}
                </p>
              ))}
            </div>

            {jobs.map((job) => (
              <div
                key={job.id}
                className="grid gap-4 items-center px-6 py-4 transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  backgroundColor: "#ffffff",
                  borderBottom: "1px solid rgba(196,198,208,0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9ff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                <p
                  className="text-sm font-bold"
                  style={{ color: "#001736", fontFamily: "Manrope, sans-serif" }}
                >
                  {job.title}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                >
                  {job.budget}
                </p>
                <span
                  className="inline-flex items-center text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest w-fit"
                  style={statusStyles[job.status] ?? { backgroundColor: "#f0f3ff", color: "#43474f" }}
                >
                  {job.status}
                </span>
                <p
                  className="text-sm"
                  style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                >
                  {job.deadline}
                </p>
                <div className="flex gap-1">
                  {/* VIEW button — navigates to job detail */}
                  <button
                    onClick={() => navigate("/job-detail")}
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded tracking-widest transition-all hover:opacity-90"
                    style={{ backgroundColor: "#001736", color: "#ffffff" }}
                  >
                    VIEW
                  </button>
                  <button
                    onClick={() => navigate("/edit-job")}
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded tracking-widest transition-all"
                    style={{ backgroundColor: "#f0f3ff", border: "1px solid #c4c6d0", color: "#001736" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7eeff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
                  >
                    EDIT
                  </button>
                  <button
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded tracking-widest transition-all hover:opacity-90"
                    style={{ backgroundColor: "#ffdad6", color: "#93000a" }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
            >
              SHOWING 4 OF 12 REGISTERED JOBS
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded text-xs flex items-center justify-center transition-all"
                style={{ border: "1px solid #c4c6d0", color: "#43474f" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7eeff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ‹
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-7 h-7 rounded text-xs font-black flex items-center justify-center transition-all"
                  style={
                    currentPage === page
                      ? { backgroundColor: "#001736", color: "#ffffff" }
                      : { border: "1px solid #c4c6d0", color: "#43474f" }
                  }
                  onMouseEnter={(e) => {
                    if (currentPage !== page) e.currentTarget.style.backgroundColor = "#e7eeff";
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="w-7 h-7 rounded text-xs flex items-center justify-center transition-all"
                style={{ border: "1px solid #c4c6d0", color: "#43474f" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7eeff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ›
              </button>
            </div>
          </div>
        </main>

        {/* Floating Action Button */}
        <button
          onClick={() => navigate("/post-a-job")}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full text-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: "#001736", color: "#ffffff" }}
        >
          +
        </button>

      </div>
    </div>
  );
}