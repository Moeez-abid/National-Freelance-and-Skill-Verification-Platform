import { useState, useEffect } from "react";

// ── Gigs screens ──────────────────────────────────────────────────────────────
import BrowseGigs        from "./pages/gigs/G03_BrowseGigs.jsx";
import GigDetail         from "./pages/gigs/G03_GigDetail.jsx";
import MyGigs            from "./pages/gigs/G03_MyGigs.jsx";
import CreateGig         from "./pages/gigs/G03_CreateGig.jsx";
import EditGig           from "./pages/gigs/G03_EditGig.jsx";
import CategorySelection from "./pages/gigs/G03_CategorySelection.jsx";

// ── Bids / Jobs screens ───────────────────────────────────────────────────────
import BrowseJobs           from "./pages/bids/G03_BrowseJobs.jsx";
import JobDetail            from "./pages/bids/G03_JobDetail.jsx";
import SubmitProposal       from "./pages/bids/G03_SubmitProposal.jsx";
import MyProposals          from "./pages/bids/G03_MyProposals.jsx";
import AcceptRejectProposal from "./pages/bids/G03_AcceptRejectProposal.jsx";
import JobBidsList          from "./pages/bids/G03_JobBidsList.jsx";
import CreateJob            from "./pages/jobs/G03_CreateJob.jsx";
import MyJobs               from "./pages/jobs/G03_MyJobs.jsx";

// ── Person 4 Screens ──────────────────────────────────────────────────────────
import GlobalSearch         from "./pages/search/G03_GlobalSearch.jsx";
import ProjectStatus        from "./pages/projects/G03_ProjectStatus.jsx";
import ProjectDetail        from "./pages/projects/G03_ProjectDetail.jsx";
import Notifications        from "./pages/system/G03_Notifications.jsx";

// ── API Service Layer (backend integration) ───────────────────────────────────
import { setAuthToken, checkHealth, jobApi, gigApi, bidApi, projectApi } from "./services/api.js";

// ─────────────────────────────────────────────────────────────────────────────
// Theme — synced across all modules via localStorage key "nexus-theme"
// Uses BroadcastChannel so switching in one module updates others instantly.
// ─────────────────────────────────────────────────────────────────────────────

const THEME_KEY = "nexus-theme";
const themeChannel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("nexus-theme-sync")
  : null;

function applyTheme(t) {
  const root = window.document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(stored);
    return stored;
  });

  useEffect(() => {
    // Listen for theme changes broadcast from other modules
    if (themeChannel) {
      themeChannel.onmessage = (e) => {
        if (e.data?.theme) {
          setTheme(e.data.theme);
          applyTheme(e.data.theme);
        }
      };
    }
    return () => { if (themeChannel) themeChannel.onmessage = null; };
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    themeChannel?.postMessage({ theme: next });
  };

  return { theme, toggleTheme };
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT helpers
// ─────────────────────────────────────────────────────────────────────────────

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Read the JWT from:
 *  1. ?token= URL param (redirect callback from Module 1 login)
 *  2. localStorage key "m3_token" (our own persisted copy)
 *  3. localStorage key "token" (Module 1 same-origin fallback)
 */
function getModule1User() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");
  if (urlToken) {
    const payload = decodeJwtPayload(urlToken);
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
      localStorage.setItem("m3_token", urlToken);
      window.history.replaceState({}, "", window.location.pathname);
      return { token: urlToken, payload };
    }
  }

  const saved = localStorage.getItem("m3_token");
  if (saved) {
    const payload = decodeJwtPayload(saved);
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
      return { token: saved, payload };
    }
    localStorage.removeItem("m3_token");
  }

  const m1Token = localStorage.getItem("token");
  if (m1Token) {
    const payload = decodeJwtPayload(m1Token);
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
      return { token: m1Token, payload };
    }
  }

  return null;
}

function TopNavBar({ onNavigate, role, currentUser, unreadCount, screen, theme, toggleTheme }) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Nav items for active-state highlighting
  // "Search" redirects to Module 4 (AI Matching) at localhost:5004
  const navItems = [
    { key: "home",       label: "Overview",    external: null              },
    { key: "browse",     label: "Marketplace", external: null              },
    { key: "myprojects", label: "Projects",    external: null              },
    { key: "search",     label: "Recommendations",      external: "http://localhost:5004" },
  ];

  const displayName = currentUser?.name || (role === "client" ? "Client" : "Freelancer");

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary dark:bg-surface-container-dark text-white z-50 flex items-center px-6 border-b border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-4 w-64 flex-shrink-0">
        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center cursor-pointer" onClick={() => onNavigate("home")}>
          <span className="material-symbols-outlined text-primary text-xl font-bold">bolt</span>
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("home")}>
          <h1 className="text-sm font-black tracking-tighter leading-none">NEXUS PRO</h1>
          <p className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none mt-1">Marketplace</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="hidden xl:flex items-center gap-6 ml-6">
        {/* Home → Module 1 */}
        <a
          href="http://localhost:3000/dashboard"
          className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
        >
          Home
        </a>

        {navItems.map(({ key, label, external }) => {
          const isActive = !external && (screen === key || (key === "home" && screen === "home"));
          return external ? (
            <a
              key={key}
              href={external}
              className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
            >
              {label}
            </a>
          ) : (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 transition-colors ${
                isActive
                  ? "text-white border-accent"
                  : "text-slate-300 border-transparent hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === "light" ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-error rounded-full text-[9px] leading-4 text-white font-black">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-container-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</h3>
                </div>
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-slate-200 dark:text-white/10 text-5xl mb-3">notifications_off</span>
                  <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-tight">All caught up!</p>
                  <p className="text-slate-400 text-[10px] font-medium mt-1">No new notifications.</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-white/10 mx-1"></div>

        {/* User info */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-tight">{displayName}</p>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{role} Mode</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function SideNavBar({ onNavigate, role, screen }) {
  const menuItems = role === 'client' ? [
    { key: "home", label: "Overview", icon: "dashboard" },
    { key: "myprojects", label: "Track Projects", icon: "hub" },
    { key: "myjobs", label: "Manage Jobs", icon: "folder_special" },
    { key: "browse", label: "Hire Talent", icon: "query_stats" },
    { key: "createjob", label: "Post a Job", icon: "article" },
  ] : [
    { key: "home", label: "Overview", icon: "dashboard" },
    { key: "myprojects", label: "Active Projects", icon: "hub" },
    { key: "mygigs", label: "Manage Gigs", icon: "folder_special" },
    { key: "browsejobs", label: "Find Work", icon: "query_stats" },
    { key: "create", label: "Create Gig", icon: "article" },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 bg-slate-50 dark:bg-[#001736] w-64 z-40 border-r border-slate-200 dark:border-white/5 transition-colors duration-300">
      <nav className="flex-grow space-y-1">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">
            {role === 'client' ? 'Client Operations' : 'Professional Console'}
          </p>
        </div>
        {menuItems.map(item => {
          const isActive = screen === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 dark:bg-white/10 text-white shadow-lg"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-[11px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4">
        <button
          onClick={() => onNavigate(role === 'client' ? "createjob" : "create")}
          className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {role === 'client' ? 'Create Project' : 'List New Service'}
        </button>

      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen registry — maps route keys → components
// ─────────────────────────────────────────────────────────────────────────────
const SCREENS = {
  // Gigs
  browse:     BrowseGigs,
  detail:     GigDetail,
  mygigs:     MyGigs,
  create:     CreateGig,
  edit:       EditGig,
  categories: CategorySelection,

  // Jobs / Bids
  browsejobs:   BrowseJobs,
  jobdetail:    JobDetail,
  submit:       SubmitProposal,
  myproposals:  MyProposals,
  acceptreject: AcceptRejectProposal,
  jobbids:      JobBidsList,
  createjob:    CreateJob,
  myjobs:       MyJobs,

  // Person 4
  globalsearch:  GlobalSearch,
  myprojects:    ProjectStatus,
  projectdetail: ProjectDetail,
  notifications: Notifications,
};

const ROUTE_ALIASES = {
  jobs: "browsejobs",
  proposals: "myproposals",
  review: "acceptreject",
  jobproposals: "jobbids",
  search: "globalsearch",
  projects: "myprojects",
};

// ─────────────────────────────────────────────────────────────────────────────
// Home Dashboard — Role-specific experience
// ─────────────────────────────────────────────────────────────────────────────
function Home({ onNavigate, backendStatus, role, currentUser, onMetricsChange }) {
  const [metrics, setMetrics] = useState({ projects: 0, unread: 0, money: 0, primary: 0, secondary: 0 });
  const [metricsError, setMetricsError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadMetrics() {
      setMetricsError("");
      try {
        const projectRes = await projectApi.myProjects();
        const projects = projectRes.success ? (projectRes.data || []) : [];
        let next = {
          projects: projects.length,
          unread: 0,
          money: projects.reduce((sum, p) => sum + Number(p.total_amount || p.total_budget || p.amount || 0), 0),
          primary: 0,
          secondary: 0,
        };

        if (role === "client") {
          const jobsRes = await jobApi.dashboard();
          const jobs = jobsRes.success ? (jobsRes.data || []) : [];
          next.primary = jobs.length;
          next.secondary = jobs.reduce((sum, job) => sum + Number(job.bids_count || 0), 0);
          next.unread = jobs.filter((job) => Number(job.bids_count || 0) > 0 && job.status === "open").length;
        } else {
          const [gigsRes, bidsRes] = await Promise.all([gigApi.myGigs(), bidApi.myBids()]);
          const gigs = gigsRes.success ? (gigsRes.data || []) : [];
          const bids = bidsRes.success ? (bidsRes.data || []) : [];
          next.primary = gigs.length;
          next.secondary = bids.length;
          next.unread = bids.filter((bid) => ["accepted", "rejected"].includes(bid.status)).length;
        }

        if (alive) {
          setMetrics(next);
          onMetricsChange?.(next);
        }
      } catch (e) {
        if (alive) setMetricsError(e.message);
      }
    }
    loadMetrics();
    return () => { alive = false; };
  }, [role, currentUser?.id]);

  const freelancerCards = [
    { key: "myprojects", label: "Active Projects",  icon: "🚀", desc: "Track your ongoing work and milestones." },
    { key: "mygigs",     label: "Manage Gigs",      icon: "📋", desc: "Edit your services and view performance." },
    { key: "browsejobs", label: "Find Work",        icon: "💼", desc: "Browse open job postings and bid." },
    { key: "myproposals",label: "My Proposals",     icon: "📑", desc: "Track your submitted bids and status." },
    { key: "create",     label: "Create New Gig",   icon: "➕", desc: "List a new service on the marketplace." },
  ];

  const clientCards = [
    { key: "myprojects", label: "Track Projects",   icon: "🚀", desc: "Monitor progress of your hired freelancers." },
    { key: "myjobs",     label: "Manage Jobs",      icon: "📋", desc: "View and edit your posted job listings." },
    { key: "browse",     label: "Hire Talent",      icon: "🔍", desc: "Find and order professional services." },
    { key: "createjob",  label: "Post a Job",       icon: "➕", desc: "Create a new project request for bids." },
    { key: "search",     label: "Global Search",    icon: "🌐", desc: "Search across all categories and skills." },
  ];

  const activeCards = role === "freelancer" ? freelancerCards : clientCards;

  const stCfg = {
    checking: { dot: "#D97706", text: "#92400E", label: "System Check..." },
    online:   { dot: "#16A34A", text: "#14532D", label: "Ready & Connected" },
    offline:  { dot: "#DC2626", text: "#7F1D1D", label: "Backend Sync Error" },
  };
  const st = stCfg[backendStatus] || stCfg.checking;

  return (
    <div className="space-y-8 max-w-7xl">
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-on-tertiary-container mb-2 block">System Analytics</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">Welcome, {currentUser?.name || (role === 'client' ? 'Business Client' : 'Expert Freelancer')}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{currentUser?.id}</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.dot }}></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{st.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold text-primary">Overview Dashboard</h3>
                <p className="text-sm text-slate-500">Manage your workspace from one central hub</p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeCards.map(({ key, label, icon, desc }) => (
                <div key={key} onClick={() => onNavigate(key)} className="p-4 bg-surface-container-low rounded-xl border border-transparent hover:border-primary-fixed-dim hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{icon}</span>
                    <h4 className="font-bold text-primary group-hover:text-tertiary-container transition-colors">{label}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Active Projects</span>
                <p className="text-3xl font-black mt-1">{metrics.projects} Running</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Unread Notifications</span>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-2xl font-black text-primary">{metrics.unread}</p>
                <button onClick={() => onNavigate("notifications")} className="text-[10px] font-bold uppercase text-tertiary-container hover:underline">View All</button>
              </div>
            </div>
            <div className="bg-tertiary-container text-white p-6 rounded-xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{role === "client" ? "Posted Jobs / Bids" : "Gigs / Proposals"}</span>
              <p className="text-2xl font-black mt-1">{metrics.primary} / {metrics.secondary}</p>
            </div>
            {metricsError && <p className="text-xs font-bold text-error">{metricsError}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Perspective Selection Screen
// Reads the logged-in user from Module 1's localStorage token.
// Only asks which perspective (freelancer / client) to use — no user listing.
// ─────────────────────────────────────────────────────────────────────────────
function PerspectiveSelection({ onSelectPerspective, m1User }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-primary uppercase tracking-tight mb-2">National Freelance & Skill Verification</h1>
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-tertiary-container">Platform — Module 3</p>
      </div>

      {/* Logged-in user badge */}
      <div className="mb-8 flex items-center gap-3 bg-surface-container px-5 py-3 rounded-full border border-outline-variant/20">
        <span className="material-symbols-outlined text-primary">verified_user</span>
        <div className="text-left">
          <p className="text-[11px] font-black uppercase tracking-wider text-primary">
            {[m1User.payload.first_name, m1User.payload.last_name].filter(Boolean).join(" ") || m1User.payload.email}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in via Module 1</p>
        </div>
      </div>

      <h2 className="text-xl font-extrabold mb-8 text-primary tracking-tight">How would you like to use the marketplace?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
        {/* Freelancer card */}
        <button
          onClick={() => onSelectPerspective("freelancer")}
          className="bg-surface-container-lowest p-8 rounded-2xl border-2 border-transparent hover:border-tertiary-fixed-dim hover:shadow-2xl transition-all text-center group focus:outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
        >
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-4xl">👩‍💻</span>
          </div>
          <h3 className="text-xl font-black text-primary uppercase mb-3">Freelancer</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Create gigs, browse job postings, submit proposals, and track your active projects.</p>
        </button>

        {/* Client card */}
        <button
          onClick={() => onSelectPerspective("client")}
          className="bg-surface-container-lowest p-8 rounded-2xl border-2 border-transparent hover:border-primary-fixed-dim hover:shadow-2xl transition-all text-center group focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
        >
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-4xl">🏢</span>
          </div>
          <h3 className="text-xl font-black text-primary uppercase mb-3">Client</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Post jobs, hire talent, review proposals, and manage your project workflow.</p>
        </button>
      </div>
    </div>
  );
}

// Shown when no Module 1 token is found — redirects user to Module 1 login
function NotLoggedIn() {
  const module1LoginUrl = `http://localhost:3000/login?redirect=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <span className="material-symbols-outlined text-6xl text-error">lock</span>
      </div>
      <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-4">Authentication Required</h1>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
        You need to be logged in through <strong>Module 1</strong> before accessing the marketplace.
      </p>
      <a
        href={module1LoginUrl}
        className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
      >
        Go to Module 1 Login
      </a>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-6">
        You will be redirected back here automatically after logging in.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App — manages active screen + initializes the API service layer
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [screenParams, setScreenParams] = useState({});
  const [backendStatus, setBackendStatus] = useState("checking");
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState({ unread: 0 });
  const [m1User, setM1User] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // On mount: read Module 1's token, validate it against Module 1's /me endpoint,
  // then health-check the Module 3 backend
  useEffect(() => {
    async function initApi() {
      const found = getModule1User();

      if (found) {
        // ── Validate token against Module 1's /me endpoint ──────────────────
        // This catches stale tokens whose user no longer exists in the DB
        // (e.g. after docker compose down -v wipes all users).
        try {
          const res = await fetch("http://localhost:5001/api/auth/me", {
            headers: { Authorization: `Bearer ${found.token}` },
          });
          if (!res.ok) {
            // Token is invalid or user no longer exists — clear everything
            localStorage.removeItem("m3_token");
            sessionStorage.removeItem("m3_perspective");
            setM1User(false);
            return;
          }

          // Token is valid — parse user details (name, etc.) from the same response
          let meData = null;
          try {
            const meJson = await res.json();
            meData = meJson.user || null;
          } catch { /* ignore parse errors */ }

          const enrichedFound = {
            ...found,
            payload: {
              ...found.payload,
              // Prefer real name from /me over JWT payload
              first_name: meData?.first_name || found.payload.first_name,
              last_name:  meData?.last_name  || found.payload.last_name,
              email:      meData?.email      || found.payload.email,
            },
          };

          setM1User(enrichedFound);
          setAuthToken(enrichedFound.token);

          // Automatically set perspective from Module 1 user role
          const actualRole = enrichedFound.payload.role || "freelancer";
          setRole(actualRole);
          const fullName = [enrichedFound.payload.first_name, enrichedFound.payload.last_name]
            .filter(Boolean).join(" ") || enrichedFound.payload.email;
          setCurrentUser({
            id: enrichedFound.payload.uuid || enrichedFound.payload.id,
            role: actualRole,
            name: fullName,
            email: enrichedFound.payload.email,
          });
        } catch {
          // Module 1 backend unreachable — clear stale token to be safe
          localStorage.removeItem("m3_token");
          sessionStorage.removeItem("m3_perspective");
          setM1User(false);
          return;
        }
      } else {
        setM1User(false);
      }

      try {
        await checkHealth();
        setBackendStatus("online");
      } catch {
        setBackendStatus("offline");
      }

      setAuthChecking(false);
    }
    initApi();
  }, []);



  const onNavigate = (key, params = {}) => {

    const target = ROUTE_ALIASES[key] || key;
    if (target in SCREENS || target === "home") {
      setScreen(target);
      setScreenParams(params);
    }
  };

  // Still validating token against Module 1
  if (authChecking) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Verifying session...</p>
      </div>
    </div>
  );

  // No Module 1 token found
  if (m1User === false) return <NotLoggedIn />;

  // Role should be set automatically now, but just in case it's still null during transition
  if (!role) return null;

  const Screen = screen === "home" ? Home : SCREENS[screen];
  const activeComponent = Screen
    ? <Screen onNavigate={onNavigate} params={screenParams} role={role} currentUser={currentUser} backendStatus={backendStatus} onMetricsChange={setDashboardMetrics} />
    : <Home onNavigate={onNavigate} backendStatus={backendStatus} role={role} currentUser={currentUser} onMetricsChange={setDashboardMetrics} />;

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-300">
      <TopNavBar
        onNavigate={onNavigate}
        role={role}
        currentUser={currentUser}
        unreadCount={dashboardMetrics.unread || 0}
        screen={screen}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex flex-1 pt-16">
        <SideNavBar onNavigate={onNavigate} role={role} screen={screen} />
        <main className="ml-64 w-full flex flex-col min-h-[calc(100vh-64px)]">
          <div className="p-8 lg:p-12">
            {activeComponent}
          </div>
          <footer className="mt-auto px-8 py-10 bg-surface-container-low dark:bg-surface-container-dark text-center border-t border-outline-variant/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">National Freelance & Skill Verification Platform © 2026 • Module 3 v1.0</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
