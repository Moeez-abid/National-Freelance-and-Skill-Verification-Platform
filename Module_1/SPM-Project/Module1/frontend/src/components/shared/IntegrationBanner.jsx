import React from 'react';

export default function IntegrationBanner({ featureName }) {
  return (
    <div className="bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10 rounded-2xl p-4 mb-8 flex items-center gap-4 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined text-white dark:text-primary text-xl">hub</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:text-accent mb-0.5">Development in Progress</p>
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          The <span className="text-slate-900 dark:text-white underline decoration-accent/30">{featureName}</span> system is currently being optimized. 
          Expect live updates and enhanced functionality soon.
        </p>
      </div>
    </div>
  );
}
