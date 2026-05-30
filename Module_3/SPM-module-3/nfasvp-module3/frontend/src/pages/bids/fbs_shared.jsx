// ─── COLOR TOKENS — theme-aware ───────────────────────────────────────────────
function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function getC() {
  const dark = isDark();
  return {
    navy:          dark ? "#89f5e7"  : "#001736",
    teal:          "#89f5e7",
    white:         dark ? "#001b3d"  : "#FFFFFF",
    bgPage:        dark ? "#00132e"  : "#f9f9ff",
    bgCard:        dark ? "#001b3d"  : "#FFFFFF",
    border:        dark ? "rgba(137,245,231,0.15)" : "#c4c6d0",
    textPrimary:   dark ? "#e2e8f0"  : "#111c2d",
    textBody:      dark ? "#94a3b8"  : "#43474f",
    textMuted:     dark ? "#64748b"  : "#747780",
    inputBg:       dark ? "#001f47"  : "#FFFFFF",
    inputText:     dark ? "#e2e8f0"  : "#111c2d",
  };
}

export const C = getC();

// ─── NAVBAR & SIDEBAR (Legacy - Now managed by App.jsx) ──────────────────────
export function Navbar() { return null; }
export function Sidebar() { return null; }

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = {
    Pending:  "bg-surface-container-high text-on-surface-variant",
    Accepted: "bg-tertiary-fixed text-on-tertiary-fixed",
    Rejected: "bg-error-container text-on-error-container",
    Active:   "bg-tertiary-fixed text-on-tertiary-fixed",
  };
  const style = cfg[status] || cfg.Pending;
  return (
    <span className={`px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-outline-variant/20 ${style}`}>
      {status}
    </span>
  );
}

// ─── SKILL TAG ───────────────────────────────────────────────────────────────
export function SkillTag({ label }) {
  return (
    <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-outline-variant/10">
      {label}
    </span>
  );
}

// ─── BTN ─────────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, small, className = "" }) {
  const variants = {
    primary:  "bg-primary text-on-primary hover:brightness-110",
    outlined: "bg-transparent text-primary border-2 border-primary hover:bg-primary/5",
    teal:     "bg-tertiary-container text-on-tertiary-container hover:brightness-110",
    danger:   "bg-transparent text-error border-2 border-error hover:bg-error/5",
    ghost:    "bg-transparent text-slate-500 hover:text-primary",
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-black uppercase tracking-widest transition-all active:scale-[0.98]
        ${small ? "px-4 py-2 text-[10px]" : "px-6 py-3 text-[11px]"}
        ${variants[variant]}
        ${className}
      `}
      style={style}
    >
      {children}
    </button>
  );
}

// ─── SECTION CARD ────────────────────────────────────────────────────────────
export function SectionCard({ children, style = {}, className = "" }) {
  return (
    <div 
      className={`bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
export function SectionHeading({ children }) {
  return (
    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">
      {children}
    </h3>
  );
}

// ─── MILESTONE BADGE ─────────────────────────────────────────────────────────
export function MilestoneBadge({ status = "Pending" }) {
  return (
    <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-outline-variant/20">
      {status}
    </span>
  );
}

export const MILESTONES = [
  { title: "Discovery & Wireframes", due: "Week 2", budget: "$400",   status: "Pending" },
  { title: "Frontend Development",   due: "Week 6", budget: "$1,200", status: "Pending" },
  { title: "Testing & Handoff",      due: "Week 8", budget: "$400",   status: "Pending" },
];
