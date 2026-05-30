import { useState } from "react";

const navItems = [
  { label: "HOME", icon: "⌂" },
  { label: "POST A JOB", icon: "✦" },
  { label: "MY LISTINGS", icon: "▤" },
  { label: "DRAFTS", icon: "✉" },
];

const categoryOptions = [
  "Select Industry Category",
  "Software Development",
  "Design & Creative",
  "Writing & Translation",
  "Marketing",
  "Data Science",
];

export default function PostAJob() {
  const [activeNav, setActiveNav] = useState("POST A JOB");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Select Industry Category");
  const [skills, setSkills] = useState(["REACT", "TAILWIND"]);
  const [newSkill, setNewSkill] = useState("");

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  const addSkill = () => {
    const trimmed = newSkill.trim().toUpperCase();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
  };

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
          className="w-56 flex-shrink-0 rounded-xl px-4 py-6 flex flex-col"
          style={{ backgroundColor: "#f0f3ff" }}
        >
          {/* Nav label */}
          <p
            className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4 px-3"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            NAVIGATION
          </p>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
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

          {/* Logout — pushed to bottom */}
          <div className="mt-auto">
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left w-full"
              style={{ color: "#43474f" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e7eeff";
                e.currentTarget.style.color = "#001736";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#43474f";
              }}
            >
              <span className="text-base leading-none">→</span>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                LOGOUT
              </span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="flex-1 min-w-0">

          {/* Page Header */}
          <div className="mb-8">
            <p
              className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              SYSTEM BLUEPRINT / V1.0
            </p>
            <h1
              className="text-5xl font-black text-[#001736] uppercase tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              POST A JOB
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl px-8 py-8 shadow-sm">

            {/* JOB TITLE */}
            <div className="mb-7">
              <label
                className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                JOB TITLE
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter position name..."
                className="w-full bg-transparent pb-2 text-sm focus:outline-none transition-all"
                style={{
                  borderBottom: "1px solid #c4c6d0",
                  color: "#001736",
                  fontFamily: "Inter, sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#001736")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#c4c6d0")}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mb-7">
              <label
                className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline the project scope and requirements..."
                rows={5}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-all resize-none h-32"
                style={{
                  backgroundColor: "#f0f3ff",
                  color: "#001736",
                  fontFamily: "Inter, sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #001736")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            {/* BUDGET + DEADLINE — side by side */}
            <div className="flex gap-6 mb-7">
              {/* BUDGET */}
              <div className="flex-1">
                <label
                  className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  BUDGET
                </label>
                <div
                  className="flex items-center pb-2"
                  style={{ borderBottom: "1px solid #c4c6d0" }}
                >
                  <span
                    className="text-sm mr-1"
                    style={{ color: "#43474f", fontFamily: "Inter, sans-serif" }}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-sm focus:outline-none w-full"
                    style={{ color: "#001736", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </div>

              {/* DEADLINE */}
              <div className="flex-1">
                <label
                  className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  DEADLINE
                </label>
                <div
                  className="flex items-center pb-2"
                  style={{ borderBottom: "1px solid #c4c6d0" }}
                >
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="bg-transparent text-sm focus:outline-none w-full"
                    style={{ color: "#001736", fontFamily: "Inter, sans-serif" }}
                  />
                  <span className="text-base ml-2" style={{ color: "#43474f" }}>📅</span>
                </div>
              </div>
            </div>

            {/* CATEGORY + SKILLS — side by side */}
            <div className="flex gap-6 mb-7">
              {/* CATEGORY */}
              <div className="flex-1">
                <label
                  className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: "#f0f3ff",
                    border: "1px solid #c4c6d0",
                    color: "#43474f",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #001736")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKILLS */}
              <div className="flex-1">
                <label
                  className="block text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  SKILLS
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase px-3 py-1 rounded tracking-widest"
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
                        className="ml-1 hover:opacity-60 transition-opacity"
                        style={{ color: "#43474f", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={addSkill}
                    className="text-[10px] font-bold uppercase px-3 py-1 rounded tracking-widest transition-all"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #c4c6d0",
                      color: "#43474f",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    + ADD SKILL
                  </button>
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                className="text-[10px] font-black uppercase px-6 py-3 rounded tracking-widest transition-all"
                style={{
                  backgroundColor: "#f0f3ff",
                  border: "1px solid #c4c6d0",
                  color: "#001736",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7eeff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f3ff")}
              >
                SAVE DRAFT
              </button>
              <button
                className="text-[10px] font-black uppercase px-6 py-3 rounded tracking-widest transition-all hover:opacity-90"
                style={{
                  backgroundColor: "#001736",
                  color: "#ffffff",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                PUBLISH JOB
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
