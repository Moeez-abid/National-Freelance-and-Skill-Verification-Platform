import React from 'react';
import IntegrationBanner from './IntegrationBanner';

export default function IntegrationForm({ title, fields }) {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <IntegrationBanner featureName={title} />
      
      <div className="card p-8 bg-white dark:bg-surface-container-dark">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Create New {title}</h2>
          <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent rounded-full text-[9px] font-black uppercase tracking-widest">Draft Mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fields.map((field, i) => (
            <div key={i} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="section-label">{field.label}</label>
              {field.type === 'textarea' ? (
                <div className="input-field min-h-[120px] bg-slate-50 dark:bg-white/5 border-dashed border-2 flex items-center justify-center text-slate-400 italic text-sm">
                  User input will be captured here by the {title} module group...
                </div>
              ) : (
                <div className="input-field bg-slate-50 dark:bg-white/5 border-dashed border-2 h-12 flex items-center px-4 text-slate-400 italic text-xs">
                  {field.placeholder || 'Waiting for system integration...'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
          <button className="flex-1 btn-secondary opacity-50 cursor-not-allowed">Save Progress</button>
          <button className="flex-1 btn-primary opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
            Submit for Integration
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
