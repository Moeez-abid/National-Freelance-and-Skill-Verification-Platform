import { useNavigate } from "react-router-dom";

const timeline = [
  { id: 1, event: "JOB POSTED", date: "10 OCT 2023 09:00", done: true },
  { id: 2, event: "BID RECEIVED", date: "11 OCT 2023 14:22", done: true },
  { id: 3, event: "INTERVIEW SCHEDULED", date: "12 OCT 2023 10:15", done: true },
  { id: 4, event: "CONTRACT SIGNED", date: "PENDING_ACTION", done: false },
];

export default function JobDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans">

      {/* Navbar provided by Integration Group */}
      <div className="w-full bg-gray-200 h-16 flex items-center px-6 text-gray-500 text-sm">
        Navbar — provided by Integration Group
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Page Header */}
        <p
          className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] mb-2"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          PROJECT_VIEW_ID_882
        </p>
        <h1
          className="text-5xl font-black text-[#001736] uppercase tracking-tight leading-tight mb-10"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          JOB DETAIL: UX/UI ARCHITECTURE AUDIT
        </h1>

        {/* Two Column Layout */}
        <div className="flex gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">

            {/* Job Info Card */}
            <div className="bg-white rounded-xl px-8 py-6 shadow-sm">

              {/* Description */}
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-3"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                DESCRIPTION
              </p>
              <p
                className="text-sm text-[#43474f] leading-relaxed mb-6"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Detailed job description for the UX/UI Architecture Audit project. This area
                contains the specific requirements and scope of the project as outlined by the
                client during creation. The freelancer is expected to deliver high-fidelity
                wireframes and a complete design system audit.
              </p>

              {/* Budget + Deadline */}
              <div className="flex gap-12 mb-6">
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    BUDGET
                  </p>
                  <p
                    className="text-2xl font-black text-[#001736]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    $4,500.00
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    DEADLINE
                  </p>
                  <p
                    className="text-2xl font-black text-[#001736]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    OCT 12, 2024
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  STATUS
                </p>
                <span
                  className="text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest"
                  style={{ backgroundColor: "#89f5e7", color: "#001736" }}
                >
                  ACTIVE_STAGING
                </span>
              </div>
            </div>

            {/* Assigned Freelancer Card */}
            <div
              className="rounded-xl px-8 py-6"
              style={{ backgroundColor: "#f0f3ff" }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-3"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ASSIGNED FREELANCER
              </p>
              <div className="flex items-center justify-between">
                <p
                  className="text-base font-bold text-[#001736]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Alex Rivera
                </p>
                <button
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[#001736] border transition-all hover:bg-[#e7eeff]"
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#c4c6d0",
                  }}
                >
                  👤
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-72 flex-shrink-0 space-y-5">

            {/* Control Panel */}
            <div className="bg-white rounded-xl px-6 py-5 shadow-sm">
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                CONTROL PANEL
              </p>
              <button
                onClick={() => navigate("/edit-job")}
                className="w-full text-[10px] font-black uppercase py-3 rounded tracking-widest transition-all mb-2 hover:opacity-90"
                style={{ backgroundColor: "#001736", color: "#ffffff" }}
              >
                EDIT JOB
              </button>
              <button
                onClick={() => navigate("/bids")}
                className="w-full text-[10px] font-black uppercase py-3 rounded tracking-widest transition-all border hover:bg-[#f0f3ff]"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#001736",
                  borderColor: "#c4c6d0",
                }}
              >
                VIEW BIDS
              </button>
            </div>

            {/* Activity Timeline */}
            <div
              className="rounded-xl px-6 py-5"
              style={{ backgroundColor: "#f0f3ff" }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest text-[#43474f] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ACTIVITY TIMELINE
              </p>

              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute left-[5px] top-2 bottom-2 w-px"
                  style={{ backgroundColor: "#c4c6d0" }}
                />

                <div className="space-y-5">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 relative">
                      {/* Dot */}
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0 mt-0.5 z-10"
                        style={{
                          backgroundColor: item.done ? "#001736" : "#c4c6d0",
                        }}
                      />
                      <div>
                        <p
                          className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            color: item.done ? "#001736" : "#43474f",
                          }}
                        >
                          {item.event}
                        </p>
                        <p
                          className="text-[10px] uppercase tracking-widest text-[#43474f]"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Back button */}
        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-black uppercase tracking-widest text-[#43474f] hover:text-[#001736] transition-all"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            ← BACK
          </button>
        </div>

      </div>
    </div>
  );
}