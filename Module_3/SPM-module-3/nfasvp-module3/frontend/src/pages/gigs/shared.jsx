// ─── COLOR TOKENS (Deprecated in favor of Tailwind) ────────────────────────────
export const C = {
  navy: "#001736",
  black: "#000000",
  white: "#FFFFFF",
  bgPage: "#F9F9FF",
  bgAlt: "#F0F3FF",
  bgCard: "#FFFFFF",
  textPrimary: "#111c2d",
  textSecondary: "#43474f",
  textMuted: "#747780",
  border: "#c4c6d0",
  green: "#10B981",
  greenDark: "#005049",
  greenBg: "#89f5e7",
  greenBorder: "#6bd8cb",
  red: "#ba1a1a",
  redBg: "#ffdad6",
  redNote: "#ffdad6",
  redDark: "#93000a",
  badgeBg: "#dee8ff",
  badgeText: "#264778",
  yellow: "#FBBF24",
  chipBg: "#f0f3ff",
  navBg: "#001736",
  teal: "#89f5e7",
};

// ─── NAVBAR (Legacy - Now managed by App.jsx) ──────────────────────────────────
export function Navbar() { return null; }

// ─── STICKY NOTE ─────────────────────────────────────────────────────────────
export function StickyNote({ text }) {
  return (
    <div className="bg-red-note border-l-4 border-error rounded-r-lg p-4 text-xs font-medium text-on-error-container leading-relaxed shadow-sm my-4">
      {text}
    </div>
  );
}

// ─── VERIFIED BADGE ──────────────────────────────────────────────────────────
export function VerifiedBadge() {
  return (
    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-tertiary-fixed-dim/20">
      <span className="material-symbols-outlined text-[10px] font-black">verified</span> Verified
    </span>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = {
    Live:   "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/30",
    Draft:  "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
    Paused: "bg-error-container text-on-error-container border-error/20",
  };
  const style = cfg[status] || cfg.Draft;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style} flex items-center gap-2`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// ─── STARS ───────────────────────────────────────────────────────────────────
export function Stars({ rating, count }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[#FBBF24] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="font-black text-xs text-primary">{rating}</span>
      {count && <span className="text-[10px] font-bold text-slate-400 uppercase">({count})</span>}
    </span>
  );
}

// ─── BTN ─────────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, small, className = "" }) {
  const variants = {
    primary:  "bg-primary text-on-primary hover:brightness-110",
    outlined: "bg-transparent text-primary border-2 border-primary hover:bg-primary/5",
    danger:   "bg-transparent text-error border-2 border-error hover:bg-error/5",
    ghost:    "bg-transparent text-slate-500 hover:text-primary hover:bg-surface-container",
    teal:     "bg-tertiary-container text-on-tertiary-container hover:brightness-110",
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

// ─── GIG CARDS DATA ──────────────────────────────────────────────────────────
export const GIG_CARDS = [
  { id: 1, name: "Ahmed Raza",   rating: "4.9", reviews: "124", title: "I will build a high-performance React web application for your business",  tags: ["React", "Node.js"],  price: "PKR 5,000",  delivery: "3 days",  color: "#E8F4FD", icon: "💻" },
  { id: 2, name: "Sara Khan",    rating: "4.8", reviews: "87",  title: "I will create a unique brand identity and logo for your startup",          tags: ["Figma", "Branding"], price: "PKR 3,500",  delivery: "5 days",  color: "#FEF3C7", icon: "🎨" },
  { id: 3, name: "Usman Ali",    rating: "4.7", reviews: "65",  title: "I will write SEO-optimized blog posts and articles for your website",      tags: ["SEO", "Writing"],    price: "PKR 2,000",  delivery: "2 days",  color: "#F0FDF4", icon: "✍️" },
  { id: 4, name: "Fatima Noor",  rating: "4.9", reviews: "203", title: "I will develop a responsive mobile app using Flutter",                     tags: ["Flutter", "Dart"],   price: "PKR 12,000", delivery: "10 days", color: "#FDF2F8", icon: "📱" },
  { id: 5, name: "Bilal Hassan", rating: "4.6", reviews: "41",  title: "I will create data visualizations and analytics dashboards",              tags: ["Python", "PowerBI"], price: "PKR 8,000",  delivery: "7 days",  color: "#F0F9FF", icon: "📊" },
  { id: 6, name: "Zara Sheikh",  rating: "4.8", reviews: "93",  title: "I will produce and edit professional promotional videos",                  tags: ["Premiere", "AE"],    price: "PKR 6,500",  delivery: "4 days",  color: "#FFF7ED", icon: "🎬" },
];