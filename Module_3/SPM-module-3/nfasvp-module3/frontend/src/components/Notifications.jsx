import { useState } from "react";

const allNotifications = [
  {
    id: 1,
    icon: "🤝",
    title: "New bid received on your project",
    subtitle: 'Alexander Thorne has submitted a proposal for "Mobile App Redesign".',
    time: "2 HOURS AGO",
    unread: true,
    type: "Bids",
  },
  {
    id: 2,
    icon: "✔",
    title: "Bid accepted by client",
    subtitle: 'TechFlow Inc. has accepted your bid for the "Cloud Infrastructure" contract.',
    time: "5 HOURS AGO",
    unread: true,
    type: "Bids",
  },
  {
    id: 3,
    icon: "💼",
    title: "Project status updated to In Progress",
    subtitle: '"API Documentation" is now active. You can start logging hours.',
    time: "YESTERDAY",
    unread: false,
    type: "Projects",
  },
  {
    id: 4,
    icon: "✉",
    title: "New message from client",
    subtitle: '"Hey, do you have a moment to discuss the updated wireframes?"',
    time: "1 DAY AGO",
    unread: true,
    type: "Messages",
  },
  {
    id: 5,
    icon: "ℹ",
    title: "System alert: Profile verification required",
    subtitle: "Please upload a valid identity document to unlock full platform features.",
    time: "2 DAYS AGO",
    unread: false,
    type: "System",
  },
];

const tabs = ["All", "Bids", "Messages", "Projects", "System"];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All"
      ? allNotifications
      : allNotifications.filter((n) => n.type === activeTab);

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      {/* <Navbar /> */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Page Header */}
        <h1
          className="text-3xl font-bold text-[#001736] mb-1"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Notifications
        </h1>
        <p
          className="text-sm text-[#43474f] mb-7"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Stay updated on your bids, projects, and messages.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-[#c4c6d0] mb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#001736] font-bold border-b-2 border-[#89f5e7]"
                  : "text-[#43474f] hover:text-[#001736]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mark all as read */}
        <div className="flex items-center gap-1.5 mb-5">
          <button
            className="text-xs text-[#43474f] hover:text-[#001736] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Mark all as read
          </button>
          <span style={{ color: "#2ca397", fontSize: "13px" }}>✓</span>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-4 px-5 py-4 rounded-xl cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: n.unread ? "#f0f3ff" : "#ffffff" }}
            >
              {/* Icon circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "#e7eeff", color: "#001736" }}
              >
                {n.icon}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-[#001736] mb-0.5"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {n.title}
                </p>
                <p
                  className="text-sm text-[#43474f] mb-2 leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {n.subtitle}
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: n.time === "YESTERDAY" ? "#2ca397" : "#43474f",
                  }}
                >
                  {n.time}
                </p>
              </div>

              {/* Unread dot */}
              {n.unread && (
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: "#89f5e7" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* End-of-list empty state */}
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "#e7eeff", color: "#001736" }}
          >
            ✓✓
          </div>
          <p
            className="text-sm text-[#43474f]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            No more new notifications
          </p>
        </div>

      </div>
    </div>
  );
}
