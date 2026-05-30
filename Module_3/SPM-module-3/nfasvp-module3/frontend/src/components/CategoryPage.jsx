import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Navbar provided by Integration Group

const jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Global Tech Solutions Inc.",
    budgetMin: 4000,
    budgetMax: 6000,
    skills: ["React", "TypeScript", "UI/UX"],
    postedTime: "Posted 2 hours ago",
    verified: true,
  },
  {
    id: 2,
    title: "Frontend Developer (SaaS Specialist)",
    company: "Horizon Cloud Solutions",
    budgetMin: 3200,
    budgetMax: 4500,
    skills: ["Tailwind CSS", "Vue.js"],
    postedTime: "Posted Yesterday",
    verified: true,
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
  },
];

const subCategories = [
  "Frontend",
  "Backend",
  "Full Stack",
  "WordPress",
  "Mobile",
  "API Development",
];

export default function CategoryPage() {
  const [activePill, setActivePill] = useState("Frontend");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      {/* Page Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* 1. Breadcrumb */}
        <nav className="mb-5 text-xs text-[#43474f]" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="hover:underline cursor-pointer">Home</span>
          <span className="mx-2 text-[#c4c6d0]">›</span>
          <span className="hover:underline cursor-pointer">Categories</span>
          <span className="mx-2 text-[#c4c6d0]">›</span>
          <span className="font-semibold text-[#001736]">Web Development</span>
        </nav>

        {/* 2. Page Header */}
        <div className="mb-7">
          <h1
            className="text-3xl font-bold text-[#001736] mb-1"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Web Development
          </h1>
          <p className="text-sm text-[#43474f]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Browse 1,248 Web Development jobs from verified clients
          </p>
        </div>

        {/* 3. Sub-category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {subCategories.map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={
                activePill === pill
                  ? "bg-[#001736] text-white rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap transition-all"
                  : "bg-[#f0f3ff] text-[#001736] border border-[#c4c6d0] rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#e7eeff]"
              }
            >
              {pill}
            </button>
          ))}
        </div>

        {/* 4. Job Cards */}
        <div className="flex flex-col gap-4 mb-10">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#e7eeff] rounded-xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                {/* Left — badge + posted time */}
                <div className="flex items-center gap-2">
                  {job.verified && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ✔ Verified
                    </span>
                  )}
                  <span className="text-xs text-[#43474f]">{job.postedTime}</span>
                </div>
                {/* Right — budget */}
                <div className="text-right">
                  <p className="text-xs text-[#43474f]">Budget</p>
                  <p
                    className="text-lg font-bold text-[#001736]"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    ${job.budgetMin.toLocaleString()} – ${job.budgetMax.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Middle — title + company */}
              <h3
                className="text-base font-bold text-[#001736] mb-0.5"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {job.title}
              </h3>
              <p className="text-sm text-[#43474f] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {job.company}
              </p>

              {/* Bottom Row — skills + button */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Skill tags */}
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-[#c4c6d0] rounded-full px-3 py-1 text-xs text-[#43474f] bg-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {/* View Details button */}
                <button
                  onClick={() => navigate("/project-detail")}
                  className="bg-white border border-[#c4c6d0] text-[#001736] text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#f0f3ff] transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Pagination */}
        <div className="flex items-center justify-center gap-2">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-9 h-9 rounded-full border border-[#c4c6d0] flex items-center justify-center text-[#43474f] hover:bg-[#e7eeff] transition-all"
          >
            ‹
          </button>

          {/* Pages 1–3 */}
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

          {/* Last page */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${currentPage === totalPages
              ? "bg-[#001736] text-white"
              : "border border-[#c4c6d0] text-[#43474f] hover:bg-[#e7eeff]"
              }`}
          >
            {totalPages}
          </button>

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-9 h-9 rounded-full border border-[#c4c6d0] flex items-center justify-center text-[#43474f] hover:bg-[#e7eeff] transition-all"
          >
            ›
          </button>
        </div>

      </div>
    </div>
  );
}
