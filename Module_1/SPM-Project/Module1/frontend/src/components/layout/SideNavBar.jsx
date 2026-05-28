import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const freelancerItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'person', label: 'My Profile', path: '/profile/edit' },
  { icon: 'history_edu', label: 'Work History', path: '/work-history' },
  { icon: 'military_tech', label: 'Certifications', path: '/certifications' },
  { icon: 'reviews', label: 'Reviews', path: '/reviews' },
  { icon: 'verified_user', label: 'Verification', path: '/verification' },
  { icon: 'inventory_2', label: 'Portfolio', path: '/portfolio' },
  { icon: 'psychology', label: 'Skills', path: '/skills' },
  { icon: 'stars', label: 'Badges', path: '/badges' },
];

const clientItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'person_search', label: 'Find Freelancers', path: '/freelancers' },
  { icon: 'assignment_ind', label: 'My Hired Talent', path: '/hired-talent' },
  { icon: 'post_add', label: 'Post a Job', path: '/post-job' },
  { icon: 'person', label: 'My Profile', path: '/profile/edit' },
];

const adminItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'group', label: 'User Management', path: '/admin/users' },
  { icon: 'policy', label: 'Review Queue', path: '/admin/reviews' },
  { icon: 'analytics', label: 'System Health', path: '/admin/system' },
  { icon: 'person', label: 'My Profile', path: '/profile/edit' },
];

export default function SideNavBar() {
  const { user, logout } = useAuth();
  const role = user?.role || 'freelancer';
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const isFreelancer = role === 'freelancer';

  let items = freelancerItems;
  if (isClient) items = clientItems;
  if (isAdmin) items = adminItems;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 dark:bg-[#001736] border-r border-slate-200 dark:border-white/5 p-4 z-40 flex flex-col transition-colors duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        <p className="section-label px-3">
          {isFreelancer ? 'Professional Console' : isClient ? 'Client Operations' : 'Platform Control'}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.path + item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}
            `}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[11px] font-black uppercase tracking-label">{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-8">
          <p className="section-label px-3">Account Settings</p>
          <NavLink
            to="/change-password"
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
              ${isActive ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}
            `}
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span className="text-[11px] font-black uppercase tracking-label">Security</span>
          </NavLink>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 space-y-2">
        {isFreelancer && (
          <NavLink to="/portfolio" className="w-full btn-primary flex items-center justify-center gap-2 py-3">
            <span className="material-symbols-outlined text-sm">add</span>
            Create Project
          </NavLink>
        )}

        {isClient && (
          <NavLink to="/projects" className="w-full btn-accent flex items-center justify-center gap-2 py-3 text-slate-900">
            <span className="material-symbols-outlined text-sm font-bold">rocket_launch</span>
            Post Project
          </NavLink>
        )}

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">logout</span>
          <span className="text-[11px] font-black uppercase tracking-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

