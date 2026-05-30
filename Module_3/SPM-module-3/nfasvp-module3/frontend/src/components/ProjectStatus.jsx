import { useState } from "react";
import { useNavigate } from "react-router-dom";

const projects = [
  { id: 1, name: "E-commerce Redesign", client: "TechCorp", status: "IN PROGRESS", deadline: "Oct 12, 2024", budget: "$4,500" },
  { id: 2, name: "Brand Identity Refresh", client: "Lumina Studio", status: "IN REVIEW", deadline: "Nov 05, 2024", budget: "$2,800" },
  { id: 3, name: "Mobile App UI Kit", client: "Swiftly SaaS", status: "COMPLETED", deadline: "Sep 28, 2024", budget: "$5,200" },
  { id: 4, name: "Landing Page Dev", client: "GreenPath", status: "OPEN", deadline: "Oct 24, 2024", budget: "$1,500" },
  { id: 5, name: "Social Media Assets", client: "Vibe Marketing", status: "CANCELLED", deadline: "Oct 01, 2024", budget: "$900" },
];

const tabs = ["ALL", "ACTIVE", "IN REVIEW", "COMPLETED", "CANCELLED"];

const statusBadge = {
  "IN PROGRESS": { backgroundColor: "#89f5e7", color: "#001736" },
  "IN REVIEW":   { backgroundColor: "#e7eeff", color: "#001736" },
  "COMPLETED":   { backgroundColor: "#001736", color: "#89f5e7" },
  "OPEN":        { backgroundColor: "#f0f3ff", color: "#43474f" },
  "CANCELLED":   { backgroundColor: "#ffdad6", color: "#93000a" },
};

export default function ProjectStatus() {
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  const filteredProjects = activeTab === "ALL"
    ? projects
    : activeTab === "ACTIVE"
    ? projects.filter((p) => p.status === "IN PROGRESS" || p.status === "OPEN")
    : projects.filter((p) => p.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* 1. Page Header */}
        <h1
          className="text-3xl font-bold text-[#001736] mb-6"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          My Projects
        </h1>

        {/* 2. Tab Navigation */}
        <div className="flex gap-6 border-b border-[#c4c6d0] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-xs uppercase tracking-widest font-bold transition-all ${
                activeTab === tab
                  ? "text-[#001736] border-b-2 border-[#89f5e7]"
                  : "text-[#43474f] hover:text-[#001736]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3. Projects Table */}
        <div className="rounded-xl overflow-hidden shadow-sm mb-10">
          {/* Column Headers */}
          <div className="bg-[#f0f3ff] grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-3">
            {["Project Name", "Client", "Status", "Deadline", "Budget", "Actions"].map((col) => (
              <p
                key={col}
                className="text-[#43474f] text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {col}
              </p>
            ))}
          </div>

          {/* Rows */}
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-[#c4c6d0]/30 hover:bg-[#f9f9ff] transition-colors"
            >
              {/* Project Name */}
              <p
                className="font-bold text-[#001736] text-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {project.name}
              </p>

              {/* Client */}
              <p className="text-[#43474f] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                {project.client}
              </p>

              {/* Status Badge */}
              <span
                className="inline-flex items-center text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest w-fit"
                style={statusBadge[project.status] ?? { backgroundColor: "#f0f3ff", color: "#43474f" }}
              >
                {project.status}
              </span>

              {/* Deadline */}
              <p className="text-[#43474f] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                {project.deadline}
              </p>

              {/* Budget */}
              <p
                className="font-bold text-[#001736] text-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {project.budget}
              </p>

              {/* Actions */}
              <button onClick={() => navigate("/project-detail")} className="bg-white border border-[#c4c6d0] text-[#001736] text-sm px-4 py-1.5 rounded-lg hover:bg-[#f0f3ff] transition-all whitespace-nowrap">
                View
              </button>
            </div>
          ))}
        </div>

        {/* 4. Empty State */}
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <span className="text-4xl">💼</span>
          <h3
            className="text-base font-bold text-[#001736]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            No more projects found
          </h3>
          <p
            className="text-sm text-[#43474f] text-center max-w-xs"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            You've reached the end of your current list. Expand your network or search for new opportunities to fill your pipeline.
          </p>
          <button
            className="border text-xs font-black uppercase px-6 py-2.5 rounded tracking-widest transition-all"
            style={{ backgroundColor: "#f0f3ff", color: "#001736", borderColor: "#c4c6d0" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e7eeff"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f0f3ff"}
          >
            BROWSE JOBS
          </button>
        </div>

      </div>
    </div>
  );
}