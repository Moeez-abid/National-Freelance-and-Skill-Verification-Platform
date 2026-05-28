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
import { setAuthToken, loadStoredToken, checkHealth } from "./services/api.js";
import { getDevToken } from "./services/devAuth.js";

// ─────────────────────────────────────────────────────────────────────────────
// Components extracted from template
// ─────────────────────────────────────────────────────────────────────────────

function TopNavBar({ onNavigate, role, activeScreen, theme, onToggleTheme }) {
  const navItems = [
    { key: "home", label: "Overview", screens: ["home"] },
    { key: "browse", label: "Marketplace", screens: ["browse", "detail", "categories", "mygigs", "create", "edit"] },
    { key: "myprojects", label: "Projects", screens: ["myprojects", "projectdetail", "myjobs", "createjob"] },
  ];

  const navButtonClass = (screens) => {
    const isActive = screens.includes(activeScreen);
    return `text-[11px] font-black uppercase tracking-widest pb-1 transition-colors ${
      isActive
        ? "text-white border-b-2 border-tertiary-fixed-dim"
        : "text-slate-300 border-b-2 border-transparent hover:text-white"
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary dark:bg-[#001736] text-white z-50 flex items-center px-6 border-b border-white/5">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4 w-64 cursor-pointer" onClick={() => onNavigate("home")}>
          <div className="w-8 h-8 bg-tertiary-fixed rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl font-bold">bolt</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter leading-none">NEXUS PRO</h1>
            <p className="text-[9px] font-bold text-tertiary-fixed uppercase tracking-widest leading-none mt-1">Professional</p>
          </div>
        </div>
        <nav className="hidden xl:flex items-center gap-8">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => onNavigate(item.key)} className={navButtonClass(item.screens)}>
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { window.location.href = "http://localhost:5004"; }}
            className="text-[11px] font-black uppercase tracking-widest pb-1 text-slate-300 border-b-2 border-transparent hover:text-white transition-colors"
          >
            Search
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-6 ml-auto">
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Toggle theme" aria-label="Toggle theme">
            <span className="material-symbols-outlined">{theme === "light" ? "dark_mode" : "light_mode"}</span>
          </button>
          <button onClick={() => onNavigate("notifications")} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-white uppercase tracking-wider">{role === 'client' ? 'Client Admin' : 'Expert Freelancer'}</p>
            <p className="text-[9px] font-medium text-slate-400 uppercase">Enterprise Mode</p>
          </div>
          <img alt="Profile" className="w-9 h-9 rounded-lg border border-white/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtwC6ZvX7GXW7EW5hevkPqMO6D95liKdTdhwlvx3v18pOpo93ZHhS0xAbYzYA-PTeYjjEsA7TDRm0W9Hvnl64vqVk00xVYJlN0kqCyZEKSBB3pdk4EmpY2urQH0TEc61HHruthRJuRhlJaGhCx_guVJzedsWuyynwDwFGILeeeof4ePBzOSGDutowFDU2i4L_9mmWN4uHBhs6CB_oUJnbCgJC-m3F_MoN5PWrUB_My5QgGSLuatV73mQC_Z78bVxt_igpzDaGCc48"/>
        </div>
      </div>
    </header>
  );
}

function SideNavBar({ onNavigate, role, activeScreen }) {
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
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 dark:bg-[#001736] border-r border-slate-200 dark:border-white/5 p-4 z-40 flex flex-col transition-colors duration-500">
      <nav className="flex-grow overflow-y-auto space-y-1">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Navigation</p>
        </div>
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              activeScreen === item.key
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[11px] font-bold tracking-wider uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-4">
        <button onClick={() => onNavigate(role === 'client' ? "createjob" : "create")} className="w-full py-3 bg-primary dark:bg-tertiary-fixed text-on-primary dark:text-primary rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-[0.98] transition-all">
          {role === 'client' ? 'Create Project' : 'List New Service'}
        </button>
        <div className="pt-4 border-t border-outline-variant/10 space-y-1">
          <button onClick={() => onNavigate("switch_role")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-tertiary-fixed transition-colors">
            <span className="material-symbols-outlined">sync_alt</span>
            <span className="text-[11px] font-bold tracking-wider uppercase">Switch Role</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-tertiary-fixed transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[11px] font-bold tracking-wider uppercase">Settings</span>
          </button>
        </div>
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
function Home({ onNavigate, backendStatus, role }) {
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
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">Welcome, {role === 'client' ? 'Business Client' : 'Expert Freelancer'}</h2>
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
              <button onClick={() => onNavigate("switch_role")} className="px-4 py-2 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded-full uppercase tracking-wider hover:brightness-95 transition-all">
                Switch to {role === 'client' ? 'Freelancer' : 'Client'} Mode
              </button>
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
                <p className="text-3xl font-black mt-1">4 Running</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Unread Notifications</span>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-2xl font-black text-primary">2</p>
                <button onClick={() => onNavigate("notifications")} className="text-[10px] font-bold uppercase text-tertiary-container hover:underline">View All</button>
              </div>
            </div>
            <div className="bg-tertiary-container text-white p-6 rounded-xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Wallet Balance</span>
              <p className="text-2xl font-black mt-1">PKR 12,400</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Selection Screen
// ─────────────────────────────────────────────────────────────────────────────
function RoleSelection({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-primary uppercase tracking-tight mb-2">National Freelance & Skill Verification</h1>
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-tertiary-container">Platform</p>
      </div>
      
      <h2 className="text-2xl font-extrabold mb-8 text-primary tracking-tight">Select Your Perspective</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div onClick={() => onSelectRole("freelancer")} className="bg-surface-container-lowest p-10 rounded-2xl border-2 border-transparent hover:border-tertiary-fixed-dim hover:shadow-2xl transition-all cursor-pointer text-center group">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-4xl">👩‍💻</span>
          </div>
          <h3 className="text-xl font-black text-primary uppercase mb-3">Expert Freelancer</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Create professional gigs, browse high-value jobs, and scale your business with enterprise tools.</p>
        </div>
        
        <div onClick={() => onSelectRole("client")} className="bg-surface-container-lowest p-10 rounded-2xl border-2 border-transparent hover:border-primary-fixed-dim hover:shadow-2xl transition-all cursor-pointer text-center group">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-4xl">🏢</span>
          </div>
          <h3 className="text-xl font-black text-primary uppercase mb-3">Business Client</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Hire top-tier talent, post complex project requirements, and manage your editorial workflow.</p>
        </div>
      </div>
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
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("module3-theme");
    if (storedTheme) return storedTheme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("module3-theme", theme);
  }, [theme]);

  useEffect(() => {
    async function initApi() {
      // Check for token in URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        setAuthToken(urlToken);
        try {
          const payloadStr = atob(urlToken.split('.')[1]);
          const payload = JSON.parse(payloadStr);
          if (payload.role) setRole(payload.role);
        } catch (e) { /* ignore */ }
      }

      // Restore token from session storage if no URL token
      const stored = loadStoredToken();
      if (stored && !urlToken) {
        try {
          const payloadStr = atob(stored.split('.')[1]);
          const payload = JSON.parse(payloadStr);
          if (payload.role) setRole(payload.role);
        } catch (e) { /* ignore */ }
      }

      // Determine initial screen based on pathname
      const pathname = window.location.pathname;
      if (pathname.includes('gig-marketplace')) {
        setScreen('browse');
      } else {
        setScreen('home');
      }

      // Health check
      try {
        await checkHealth();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    }
    initApi();
  }, []);

  const handleSelectRole = async (selectedRole) => {
    try {
      const devToken = await getDevToken(selectedRole);
      setAuthToken(devToken);
      setRole(selectedRole);
      setScreen("home");
    } catch (e) {
      console.warn("[API] Could not generate dev token:", e.message);
    }
  };

  const onNavigate = (key, params = {}) => {
    if (key === "switch_role") {
      setRole(null);
      setScreen("home");
      setScreenParams({});
      setAuthToken(null);
      return;
    }
    const target = ROUTE_ALIASES[key] || key;
    if (target in SCREENS || target === "home") {
      setScreen(target);
      setScreenParams(params);
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
  };

  if (!role) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  const Screen = screen === "home" ? Home : SCREENS[screen];
  const activeComponent = Screen ? <Screen onNavigate={onNavigate} params={screenParams} role={role} backendStatus={backendStatus} /> : <Home onNavigate={onNavigate} backendStatus={backendStatus} role={role} />;

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#00132e] transition-colors duration-300">
      <TopNavBar onNavigate={onNavigate} role={role} activeScreen={screen} theme={theme} onToggleTheme={toggleTheme} />
      <div className="flex flex-1 pt-16">
        <SideNavBar onNavigate={onNavigate} role={role} activeScreen={screen} />
        <main className="ml-64 w-full flex flex-col min-h-screen">
          <div className="p-8 lg:p-12">
            {activeComponent}
          </div>
          <footer className="mt-auto px-8 py-10 bg-surface-container-low dark:bg-[#001736] text-center border-t border-outline-variant/10 dark:border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">National Freelance & Skill Verification Platform © 2026 • National Freelance & Skill Verification Platform Pro v1.0</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
