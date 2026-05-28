import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "DASHBOARD", icon: "▦" },
  { label: "JOBS", icon: "✦" },
  { label: "FAQ", icon: "?" },
  { label: "SETTINGS", icon: "⚙" },
];

export default function EditJob() {
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState("Senior Architectural Consultant");
  const [description, setDescription] = useState(
    "Leading the structural integrity analysis for the new metropolitan monolith project. Requires deep understanding of brutalist aesthetics and modular assembly."
  );
  const [budget, setBudget] = useState("12,500.00");
  const [deadline, setDeadline] = useState("2024-12-15");
  const [category, setCategory] = useState("Architecture");
  const [skills, setSkills] = useState(["CAD", "BRUTALISM", "STRUCTURAL"]);
  const [activeNav, setActiveNav] = useState("JOBS");

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
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
              MANAGEMENT
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.label === "DASHBOARD") { navigate("/client-dashboard"); return; }
                  if (item.label === "JOBS") { navigate("/my-jobs"); return; }
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
            SYSTEM / EDITING
          </p>
          <h1
            className="text-5xl font-black text-[#001736] uppercase tracking-tight mb-8"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            EDIT JOB
          </h1>

          {/* Two column layout — form left, metadata right */}
          <div className="flex gap-6 items-start">

            {/* LEFT — Form */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Job Title */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  JOB TITLE
                </p>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001736] transition-all"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c4c6d0",
                    color: "#001736",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  DESCRIPTION
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#001736] transition-all resize-none"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c4c6d0",
                    color: "#43474f",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>

              {/* Budget + Deadline */}
              <div className="flex gap-6">
                {/* Budget */}
                <div className="flex-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    BUDGET
                  </p>
                  <div
                    className="flex items-center rounded-lg px-4 py-2.5"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #c4c6d0",
                    }}
                  >
                    <span
                      className="text-sm mr-2 font-bold"
                      style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                    >
                      $
                    </span>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full text-sm focus:outline-none bg-transparent"
                      style={{ color: "#001736", fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    DEADLINE
                  </p>
                  <div
                    className="flex items-center rounded-lg px-4 py-2.5"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #c4c6d0",
                    }}
                  >
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-sm focus:outline-none bg-transparent"
                      style={{ color: "#001736", fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                </div>
              </div>

              {/* Category + Skills */}
              <div className="flex gap-6">
                {/* Category */}
                <div className="flex-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    CATEGORY
                  </p>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001736] transition-all"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #c4c6d0",
                      color: "#43474f",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <option>Architecture</option>
                    <option>Software Development</option>
                    <option>Design & Creative</option>
                    <option>Writing & Translation</option>
                    <option>Marketing</option>
                    <option>Data Science</option>
                  </select>
                </div>

                {/* Skills */}
                <div className="flex-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    SKILLS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest"
                        style={{
                          backgroundColor: "#f0f3ff",
                          border: "1px solid #c4c6d0",
                          color: "#001736",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:opacity-60 transition-all"
                          style={{ color: "#43474f" }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  className="text-[10px] font-black uppercase px-8 py-3 rounded tracking-widest transition-all hover:opacity-90"
                  style={{ backgroundColor: "#001736", color: "#ffffff" }}
                >
                  SAVE CHANGES
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="text-[10px] font-black uppercase px-8 py-3 rounded tracking-widest transition-all"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c4c6d0",
                    color: "#001736",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                >
                  CANCEL
                </button>
              </div>

            </div>

            {/* RIGHT — Metadata + Status */}
            <div className="w-56 flex-shrink-0 space-y-4">

              {/* Metadata Summary */}
              <div
                className="rounded-xl px-5 py-5"
                style={{ backgroundColor: "#f0f3ff" }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  METADATA SUMMARY
                </p>

                <div className="space-y-3">
                  <div>
                    <p
                      className="text-[9px] font-black uppercase tracking-widest text-[#43474f]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      JOB ID
                    </p>
                    <p
                      className="text-xs font-bold text-[#001736]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      BPRINT-772-XX
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[9px] font-black uppercase tracking-widest text-[#43474f]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      CREATED DATE
                    </p>
                    <p
                      className="text-xs font-bold text-[#001736]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      OCT 24, 2023
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[9px] font-black uppercase tracking-widest text-[#43474f]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      LAST MODIFIED
                    </p>
                    <p
                      className="text-xs font-bold text-[#001736]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      JAN 12, 2024
                    </p>
                  </div>

                  {/* Completeness */}
                  <div className="pt-3 border-t" style={{ borderColor: "#c4c6d0" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p
                        className="text-[9px] font-black uppercase tracking-widest text-[#43474f]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        COMPLETENESS
                      </p>
                      <p
                        className="text-lg font-black text-[#001736]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        85%
                      </p>
                    </div>
                    <div
                      className="w-full h-1 rounded-full"
                      style={{ backgroundColor: "#e7eeff" }}
                    >
                      <div
                        className="h-1 rounded-full"
                        style={{ width: "85%", backgroundColor: "#001736" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div
                className="rounded-xl px-5 py-5"
                style={{ backgroundColor: "#f0f3ff" }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span style={{ color: "#43474f", fontSize: "14px" }}>ℹ</span>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    STATUS NOTE
                  </p>
                </div>
                <p
                  className="text-xs text-[#43474f] leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  This job is currently active. Saving changes will immediately update the live
                  listing across all Blueprint channels.
                </p>

                {/* Edit FAB */}
                <div className="flex justify-end mt-4">
                  <button
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm hover:opacity-90 transition-all"
                    style={{ backgroundColor: "#001736" }}
                  >
                    ✎
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}