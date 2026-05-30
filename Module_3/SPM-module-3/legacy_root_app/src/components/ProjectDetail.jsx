import { useState } from "react";
import { useNavigate } from "react-router-dom";
const scheduleSteps = ["Open", "In Review", "In Progress", "Completed"];

const activityHistory = [
  {
    id: 1,
    title: "Milestone 1 Completed",
    date: "October 12, 2024 at 10:26 PM",
    active: true,
  },
  {
    id: 2,
    title: "Contract Signed",
    date: "October 03, 2024",
    active: false,
  },
  {
    id: 3,
    title: "Project Started",
    date: "September 28, 2024",
    active: false,
  },
];

const assets = [
  { id: 1, icon: "📄", name: "Brand_Guidelines.pdf", meta: "4.2 MB • Updated yesterday" },
  { id: 2, icon: "🎨", name: "UI_Style_Guide.fig", meta: "12.8 MB • Oct 1" },
];

export default function ProjectDetail() {
  const [activeStep] = useState("In Progress");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Breadcrumb + Status Badge */}
        <div className="flex items-center gap-3 mb-6">
          <nav className="text-xs text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
            <span
              onClick={() => navigate("/project-status")}
              className="hover:underline cursor-pointer uppercase tracking-wide font-bold text-[#43474f]">
              My Projects
            </span>
            <span className="mx-2 text-[#c4c6d0]">›</span>
            <span className="uppercase tracking-wide font-bold text-[#43474f]">View Detail</span>
          </nav>
          <span className="bg-[#89f5e7] text-[#001736] text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest">
            IN PROGRESS
          </span>
        </div>

        {/* Page Title */}
        <h1
          className="text-3xl font-bold text-[#001736] mb-8"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          E-commerce Redesign
        </h1>

        {/* Two-Column Layout */}
        <div className="flex gap-8 items-start">

          {/* LEFT — Main Content */}
          <div className="flex-1 space-y-8 min-w-0">

            {/* Project Overview */}
            <div className="bg-white rounded-xl px-6 py-5 shadow-sm">
              <h2
                className="text-base font-bold text-[#001736] mb-3"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Project Overview
              </h2>
              <p className="text-sm text-[#43474f] leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                Comprehensive redesign of the core e-commerce experience focusing on mobile-first
                navigation and checkout conversion. The objective is to modernize the aesthetic to align
                with premium fashion editorial standards while maintaining performance benchmarks.
              </p>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["React", "Tailwind", "Node.js"].map((skill) => (
                  <span
                    key={skill}
                    className="border border-[#c4c6d0] rounded-full px-3 py-1 text-xs text-[#43474f] bg-[#f0f3ff]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Budget + Deadline */}
              <div className="flex gap-10 pt-5 border-t border-[#c4c6d0]/30">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#43474f] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    Budget
                  </p>
                  <p className="text-xl font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    $4,500
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#43474f] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    Deadline
                  </p>
                  <p className="text-xl font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Oct 12, 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Assets & Briefs */}
            <div className="bg-white rounded-xl px-6 py-5 shadow-sm">
              <h2
                className="text-base font-bold text-[#001736] mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Assets & Briefs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 bg-[#f0f3ff] rounded-lg px-4 py-3 cursor-pointer hover:bg-[#e7eeff] transition-colors"
                  >
                    <span className="text-2xl">{asset.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {asset.name}
                      </p>
                      <p className="text-xs text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {asset.meta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History */}
            <div className="bg-white rounded-xl px-6 py-5 shadow-sm">
              <h2
                className="text-base font-bold text-[#001736] mb-5"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Activity History
              </h2>
              <div className="relative pl-5">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#c4c6d0]/50" />

                <div className="space-y-6">
                  {activityHistory.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4">
                      {/* Dot */}
                      <div
                        className={`absolute -left-5 mt-1 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                          item.active
                            ? "bg-[#89f5e7] border-[#001736]"
                            : "bg-[#f0f3ff] border-[#c4c6d0]"
                        }`}
                      />
                      <div className="ml-1">
                        <p
                          className={`text-sm font-bold ${item.active ? "text-[#001736]" : "text-[#43474f]"}`}
                          style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-[#43474f] mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                          {item.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-64 flex-shrink-0 space-y-5">

            {/* Current Schedule */}
            <div className="bg-white rounded-xl px-5 py-5 shadow-sm">
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Current Schedule
              </p>
              <div className="space-y-2">
                {scheduleSteps.map((step) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      step === activeStep
                        ? "bg-[#001736] text-[#89f5e7]"
                        : "bg-[#f0f3ff] text-[#43474f]"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span className="text-base">
                      {step === activeStep ? "▶" : step === "Completed" ? "✓" : "○"}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Talent */}
            <div className="bg-white rounded-xl px-5 py-5 shadow-sm">
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Assigned Talent
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#e7eeff] flex items-center justify-center text-lg font-bold text-[#001736]">
                  AR
                </div>
                <div>
                  <p className="text-sm font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Alex Rivera
                  </p>
                  <p className="text-xs text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
                    Senior UI Engineer
                  </p>
                </div>
              </div>

              <div className="flex gap-6 pt-4 border-t border-[#c4c6d0]/30 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
                    Rate
                  </p>
                  <p className="text-sm font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    $50/hr
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
                    Timeline
                  </p>
                  <p className="text-sm font-bold text-[#001736]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    4 weeks
                  </p>
                </div>
              </div>

              <button className="w-full bg-[#001736] text-white text-[10px] font-black uppercase px-4 py-2.5 rounded tracking-widest hover:opacity-90 transition-all">
                Message Freelancer
              </button>
            </div>

            {/* Client Details */}
            <div className="bg-white rounded-xl px-5 py-5 shadow-sm">
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Client Details
              </p>
              <p
                className="text-sm font-bold text-[#001736] mb-1"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                TechCorp
              </p>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-bold text-[#001736]">4.9</span>
                <span className="text-xs text-[#43474f]">(124 reviews)</span>
              </div>
              <p className="text-xs text-[#43474f]" style={{ fontFamily: "Inter, sans-serif" }}>
                Member since 2021
              </p>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
