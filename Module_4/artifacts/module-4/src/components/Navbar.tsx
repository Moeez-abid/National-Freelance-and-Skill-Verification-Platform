import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useRole } from "./RoleContext";
import { useData } from "../hooks/useData";
import { Bell, Briefcase, Moon, Sun } from "lucide-react";


export function Navbar() {
  const { role, setRole, activeFreelancerId, setActiveFreelancerId, isAuthenticated } = useRole();
  const { freelancers } = useData();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("module4-theme");
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const activeFreelancer = freelancers.find(f => f.id === activeFreelancerId) || freelancers[0];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("module4-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated && !activeFreelancerId && freelancers.length > 0) {
      setActiveFreelancerId(freelancers[0].id);
    }
  }, [isAuthenticated, activeFreelancerId, freelancers, setActiveFreelancerId]);

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-[#001736] dark:bg-[#001736] text-white border-b border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-4 w-64">
            <div className="w-8 h-8 bg-[#89f5e7] text-[#001736] rounded flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter leading-none text-white">NEXUS PRO</h1>
              <p className="text-[9px] font-bold text-[#89f5e7] uppercase tracking-widest leading-none mt-1">Professional</p>
            </div>
          </Link>

        <nav className="hidden xl:flex items-center gap-6 ml-6">
          {/* Home → Module 1 */}
          <a
            href="http://localhost:3000/dashboard"
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
          >
            Home
          </a>
          <a
            href="http://localhost:3003"
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
          >
            Overview
          </a>
          <a
            href="http://localhost:3003"
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
          >
            Marketplace
          </a>
          <a
            href="http://localhost:3003"
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-transparent text-slate-300 hover:text-white transition-colors"
          >
            Projects
          </a>
          <Link href="/" className="text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-[#89f5e7] text-white">
            Search
          </Link>
        </nav>
        
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(currentTheme => currentTheme === "light" ? "dark" : "light")}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          {/* User info */}
          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black uppercase tracking-tight">
                {activeFreelancer?.name || (role === "Client" ? "Client" : "Freelancer")}
              </p>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{role} Mode</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeFreelancer?.name || (role === "Client" ? "Client" : "Freelancer"))}&background=random`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
