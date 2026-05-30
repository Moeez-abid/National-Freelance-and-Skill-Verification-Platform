import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Navbar provided by Integration Group
// import Navbar from "../components/Navbar";

const jobListings = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Global Tech Solutions Inc.",
    budgetMin: 4000,
    budgetMax: 6000,
    skills: ["React", "TypeScript", "UI/UX"],
    postedTime: "Posted 2 hours ago",
    verified: true,
    type: "Fixed Price",
  },
  {
    id: 2,
    title: "Full-Stack Web Architect",
    company: "Nexus Creative Studio",
    budgetMin: 8500,
    budgetMax: 12000,
    skills: ["Node.js", "Next.js", "PostgreSQL"],
    postedTime: "Posted 5 hours ago",
    verified: false,
    type: "Contractual",
  },
  {
    id: 3,
    title: "Full-Stack Web Architect",
    company: "Nexus Creative Studio",
    budgetMin: 8500,
    budgetMax: 12000,
    skills: ["Node.js", "Next.js", "PostgreSQL"],
    postedTime: "Posted 5 hours ago",
    verified: false,
    type: "Contractual",
  },
];

const categories = [
  "Software Development",
  "Design & Creative",
  "Writing & Translation",
  "Marketing",
  "Data Science",
];

const skillOptions = ["React", "TypeScript", "Node.js", "Next.js", "Tailwind", "Python", "Vue.js"];

export default function SearchResults() {
  const [searchQuery, setSearchQuery] = useState("web developer");
  const [selectedCategory, setSelectedCategory] = useState("Software Development");
  const [budgetMin] = useState(1500);
  const [budgetMax, setBudgetMax] = useState(8500);
  const [selectedSkills, setSelectedSkills] = useState(["React", "TypeScript"]);
  const [location, setLocation] = useState("San Francisco, CA");
  const [deadline, setDeadline] = useState("Oct 12 - Dec 30");
  const [jobType, setJobType] = useState("Fixed Price");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar placeholder - provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      {/* Main Layout */}
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">

        {/* LEFT SIDEBAR — Filters */}
        <aside className="w-56 flex-shrink-0">

          {/* Category */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Category</p>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-[#c4c6d0] rounded-md px-3 py-2 text-sm bg-[#f9f9ff] text-[#43474f] focus:outline-none focus:ring-2 focus:ring-[#89f5e7]"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Budget Range</p>
            <input
              type="range"
              min={500}
              max={20000}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full accent-[#001736]"
            />
            <div className="flex justify-between text-xs text-[#43474f] mt-1">
              <span>${budgetMin.toLocaleString()}</span>
              <span>${budgetMax.toLocaleString()}+</span>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${selectedSkills.includes(skill)
                    ? "bg-[#001736] border-[#001736] text-[#89f5e7] font-semibold"
                    : "bg-white border-[#c4c6d0] text-[#43474f]"
                    }`}
                >
                  {skill} {selectedSkills.includes(skill) && "×"}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Location</p>
            <div className="flex items-center border border-[#c4c6d0] rounded-md px-3 py-2 bg-white">
              <span className="text-[#43474f] mr-2 text-sm">📍</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location..."
                className="text-sm w-full focus:outline-none text-[#43474f]"
              />
            </div>
          </div>

          {/* Project Deadline */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Project Deadline</p>
            <div className="flex items-center border border-[#c4c6d0] rounded-md px-3 py-2 bg-white">
              <span className="text-[#43474f] mr-2 text-sm">📅</span>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Select date range"
                className="text-sm w-full focus:outline-none text-[#43474f]"
              />
            </div>
          </div>

          {/* Job Type */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#43474f] uppercase tracking-wide mb-2">Job Type</p>
            {["Fixed Price", "Hourly Rate"].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-[#43474f] mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="jobType"
                  value={type}
                  checked={jobType === type}
                  onChange={() => setJobType(type)}
                  className="accent-[#001736]"
                />
                {type}
              </label>
            ))}
          </div>

          {/* Buttons */}
          <button className="bg-[#001b18] text-[#89f5e7] text-[10px] font-black uppercase px-4 py-3 rounded tracking-widest hover:opacity-90 transition-all w-full mb-2">
            Apply Filters
          </button>
          <button className="w-full text-[#43474f] text-sm hover:text-[#001736] transition-all">
            Reset All
          </button>
        </aside>

        {/* RIGHT — Search Results */}
        <main className="flex-1">

          {/* Search Bar + Results Count */}
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-[#001736]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              124 results for{" "}
              <span className="text-[#43474f]">"{searchQuery}"</span>
            </h2>
            <div className="flex items-center border border-[#c4c6d0] rounded-full px-4 py-2 bg-[#f0f3ff] w-64">
              <span className="text-[#43474f] mr-2">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm w-full bg-transparent focus:outline-none text-[#43474f]"
              />
            </div>
          </div>

          {/* Job Cards */}
          <div className="flex flex-col gap-4">
            {jobListings.map((job) => (
              <div
                key={job.id}
                className="bg-[#e7eeff] rounded-xl px-6 py-5 flex items-start justify-between hover:shadow-md transition-shadow"
              >
                {/* Left Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {job.verified && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        ✔ Verified
                      </span>
                    )}
                    <span className="text-xs text-[#43474f]">{job.postedTime}</span>
                  </div>
                  <h3
                    className="text-lg font-bold text-[#001736] mb-1"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {job.title}
                  </h3>
                  <p className="text-sm text-[#43474f] mb-3">{job.company}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs border border-[#c4c6d0] rounded-full px-3 py-1 text-[#43474f] bg-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right — Budget + Button */}
                <div className="flex flex-col items-end gap-3 ml-6 min-w-[160px]">
                  <div className="text-right">
                    <p className="text-xs text-[#43474f]">Budget</p>
                    <p
                      className="text-xl font-bold text-[#001736]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/project-detail")}
                    className="bg-white border border-[#c4c6d0] text-[#001736] text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#f0f3ff] transition-all">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-full border border-[#c4c6d0] flex items-center justify-center text-[#43474f] hover:bg-[#e7eeff] transition-all"
            >
              ‹
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${currentPage === page
                  ? "bg-[#001736] text-white"
                  : "border border-[#c4c6d0] text-[#43474f] hover:bg-[#e7eeff]"
                  }`}
              >
                {page}
              </button>
            ))}
            <span className="text-[#43474f] text-sm">...</span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${currentPage === totalPages
                ? "bg-[#001736] text-white"
                : "border border-[#c4c6d0] text-[#43474f] hover:bg-[#e7eeff]"
                }`}
            >
              {totalPages}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-9 h-9 rounded-full border border-[#c4c6d0] flex items-center justify-center text-[#43474f] hover:bg-[#e7eeff] transition-all"
            >
              ›
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}