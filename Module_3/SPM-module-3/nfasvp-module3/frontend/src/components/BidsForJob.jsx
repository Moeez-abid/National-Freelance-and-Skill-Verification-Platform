import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "DASHBOARD", icon: "▦" },
  { label: "ACTIVE BIDS", icon: "✦" },
  { label: "MESSAGES", icon: "✉" },
  { label: "CONTRACTS", icon: "▤" },
  { label: "ARCHIVE", icon: "▢" },
];

const initialBids = [
  {
    id: 1,
    identifier: "Freelancer #12345",
    investment: "$1,200.00",
    timeline: "14 Days",
    abstract:
      "Proposed solution covers full architectural review and modular system redesign. Deliverables include documentation, wireframes, and a phased implementation roadmap.",
    status: "pending",
  },
  {
    id: 2,
    identifier: "Freelancer #98211",
    investment: "$950.00",
    timeline: "10 Days",
    abstract:
      "Streamlined approach focusing on core deliverables with rapid turnaround. Experience in similar projects ensures quality output within the proposed timeline.",
    status: "pending",
  },
];

export default function BidsForJob() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("ACTIVE BIDS");
  const [bids, setBids] = useState(initialBids);
  const [sortBy, setSortBy] = useState("NEWEST");

  const handleAccept = (id) => {
    setBids((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "accepted" } : b))
    );
  };

  const handleReject = (id) => {
    setBids((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "rejected" } : b))
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">

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
              BLUEPRINT
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-widest text-[#43474f] mt-0.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              PROJECT PORTAL
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

          {/* Page Header */}
          <p
            className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            PROJECT OVERSIGHT
          </p>
          <h1
            className="text-4xl font-black text-[#001736] tracking-tight mb-1"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Bids for UX/UI Architecture Audit
          </h1>
          <div
            className="w-16 h-0.5 mb-8"
            style={{ backgroundColor: "#001736" }}
          />

          {/* Sort + Total row */}
          <div className="flex items-center justify-between mb-6">
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{
                backgroundColor: "#f0f3ff",
                border: "1px solid #c4c6d0",
              }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                SORT BY:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] font-black uppercase tracking-widest bg-transparent focus:outline-none"
                style={{ color: "#001736", fontFamily: "Inter, sans-serif" }}
              >
                <option>NEWEST</option>
                <option>OLDEST</option>
                <option>LOWEST BID</option>
                <option>HIGHEST BID</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-[#43474f]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                TOTAL ACTIVE BIDS:
              </span>
              <span
                className="text-[10px] font-black text-[#001736]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                04
              </span>
            </div>
          </div>

          {/* Bid Cards */}
          <div className="flex flex-col gap-4 mb-8">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid #c4c6d0",
                  backgroundColor:
                    bid.status === "accepted"
                      ? "#f0fff8"
                      : bid.status === "rejected"
                      ? "#fff4f4"
                      : "#ffffff",
                }}
              >
                <div className="flex items-stretch">

                  {/* LEFT — Bid Info */}
                  <div
                    className="w-48 flex-shrink-0 px-5 py-5"
                    style={{ backgroundColor: "#f0f3ff" }}
                  >
                    <div className="mb-4">
                      <p
                        className="text-[9px] font-black uppercase tracking-widest text-[#43474f] mb-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        IDENTIFIER
                      </p>
                      <p
                        className="text-sm font-bold text-[#001736]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {bid.identifier}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p
                        className="text-[9px] font-black uppercase tracking-widest text-[#43474f] mb-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        INVESTMENT
                      </p>
                      <p
                        className="text-xl font-black text-[#001736]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {bid.investment}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[9px] font-black uppercase tracking-widest text-[#43474f] mb-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        TIMELINE
                      </p>
                      <p
                        className="text-sm font-bold text-[#001736]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {bid.timeline}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE — Proposal Abstract */}
                  <div className="flex-1 px-6 py-5">
                    <p
                      className="text-[9px] font-black uppercase tracking-widest text-[#43474f] mb-3"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      PROPOSAL ABSTRACT
                    </p>
                    <p
                      className="text-sm text-[#43474f] leading-relaxed"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {bid.abstract}
                    </p>

                    {/* Status indicator */}
                    {bid.status !== "pending" && (
                      <span
                        className="inline-flex mt-3 text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest"
                        style={
                          bid.status === "accepted"
                            ? { backgroundColor: "#89f5e7", color: "#001736" }
                            : { backgroundColor: "#ffdad6", color: "#93000a" }
                        }
                      >
                        {bid.status === "accepted" ? "ACCEPTED" : "REJECTED"}
                      </span>
                    )}
                  </div>

                  {/* RIGHT — Actions */}
                  <div className="w-44 flex-shrink-0 flex flex-col items-stretch justify-center gap-2 px-5 py-5">
                    <button
                      onClick={() => handleAccept(bid.id)}
                      className="text-[10px] font-black uppercase py-2.5 rounded tracking-widest transition-all hover:opacity-90"
                      style={{ backgroundColor: "#001736", color: "#ffffff" }}
                    >
                      ACCEPT
                    </button>
                    <button
                      onClick={() => handleReject(bid.id)}
                      className="text-[10px] font-black uppercase py-2.5 rounded tracking-widest transition-all"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #c4c6d0",
                        color: "#001736",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                    >
                      REJECT
                    </button>
                    <button
                      className="text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-60 mt-1"
                      style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                    >
                      VIEW FULL PROPOSAL
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center">
            <button
              className="text-[10px] font-black uppercase px-10 py-3 rounded tracking-widest transition-all"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #c4c6d0",
                color: "#001736",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              LOAD ADDITIONAL BIDS
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}