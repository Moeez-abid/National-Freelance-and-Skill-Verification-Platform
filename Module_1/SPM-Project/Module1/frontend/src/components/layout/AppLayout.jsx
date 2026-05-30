import React from 'react';
import TopNavBar from './TopNavBar';
import SideNavBar from './SideNavBar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      <SideNavBar />
      <main className="ml-64 pt-16 min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-300">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
        <footer className="py-12 border-t border-slate-200 dark:border-white/5 mt-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            NEXUS PROFESSIONAL © 2024 • EDITORIAL ENGINE DESIGN PROTOCOL V1.0
          </p>
          <div className="flex justify-center gap-6 mt-4">
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map(link => (
              <a key={link} href="#" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-accent transition-colors">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
