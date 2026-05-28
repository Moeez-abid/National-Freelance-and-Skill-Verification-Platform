import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useRole } from "./RoleContext";
import { useData } from "../hooks/useData";
import { Bell, Briefcase, Moon, Search, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { role, setRole, activeFreelancerId, setActiveFreelancerId } = useRole();
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
    if (!activeFreelancerId && freelancers.length > 0) {
      setActiveFreelancerId(freelancers[0].id);
    }
  }, [activeFreelancerId, freelancers, setActiveFreelancerId]);

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

          <div className="hidden xl:flex items-center gap-8">
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-white border-b-2 border-[#89f5e7] pb-1">
              {role === "Freelancer" ? "Dashboard" : "Find Talent"}
            </Link>
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-slate-300 border-b-2 border-transparent pb-1 hover:text-white transition-colors">
              Matches
            </Link>
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-slate-300 border-b-2 border-transparent pb-1 hover:text-white transition-colors">
              Projects
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-white/10 p-1 rounded-lg items-center shadow-sm">
            <button
              onClick={() => setRole("Freelancer")}
              className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${role === "Freelancer" ? "bg-white text-[#001736] shadow-sm" : "text-slate-300 hover:text-white"}`}
            >
              Freelancer
            </button>
            <button
              onClick={() => setRole("Client")}
              className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${role === "Client" ? "bg-white text-[#001736] shadow-sm" : "text-slate-300 hover:text-white"}`}
            >
              Client
            </button>
          </div>

          <button className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Search" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTheme(currentTheme => currentTheme === "light" ? "dark" : "light")}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative" title="Notifications" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {role === "Freelancer" && activeFreelancer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarFallback style={{ backgroundColor: activeFreelancer.avatarColor, color: "white" }}>
                      {activeFreelancer.initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{activeFreelancer.name}</p>
                    <p className="text-xs text-muted-foreground leading-none">{activeFreelancer.title}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Demo User</DropdownMenuLabel>
                {freelancers.map(f => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => setActiveFreelancerId(f.id)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.avatarColor }} />
                    {f.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {role === "Client" && (
            <Avatar className="h-10 w-10 border border-white/10 bg-[#89f5e7] text-[#001736]">
              <AvatarFallback>CL</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </nav>
  );
}
