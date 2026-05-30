import React from 'react';
import { useLocation } from 'react-router-dom';
import IntegrationBanner from '../components/shared/IntegrationBanner';
import IntegrationForm from '../components/shared/IntegrationForm';

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname;

  // Paths that should show a dummy form instead of just a message
  if (path === '/projects') {
    return (
      <IntegrationForm 
        title="Project Management" 
        fields={[
          { label: 'Project Title', placeholder: 'e.g. AI Content Refresher Agent' },
          { label: 'Department', placeholder: 'Engineering, Marketing, HR...' },
          { label: 'Required Skillsets', placeholder: 'React, Node.js, Python...' },
          { label: 'Estimated Timeline', placeholder: 'e.g. 6 Months' },
          { label: 'Detailed Scope & Objectives', type: 'textarea', fullWidth: true },
        ]}
      />
    );
  }

  if (path === '/payments') {
    return (
      <IntegrationForm 
        title="Financial Portal" 
        fields={[
          { label: 'Recipient Username', placeholder: 'Find freelancer...' },
          { label: 'Amount (PKR)', placeholder: '0.00' },
          { label: 'Currency / Token', placeholder: 'PKR, USDT, ETH...' },
          { label: 'Escrow Release Terms', type: 'textarea', fullWidth: true },
        ]}
      />
    );
  }

  const getModuleName = () => {
    const p = path.split('/')[1];
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <IntegrationBanner featureName={`${getModuleName()} Protocol`} />
      
      <div className="card p-12 md:p-20 text-center border-dashed bg-white dark:bg-surface-container-dark relative overflow-hidden group">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 dark:bg-accent/10 flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:rotate-12 transition-transform duration-500">
            <span className="material-symbols-outlined text-5xl text-primary dark:text-accent animate-pulse">
              {path.includes('payment') ? 'payments' : path.includes('project') ? 'rocket_launch' : 'hub'}
            </span>
          </div>
          
          <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-6">
            Under Implementation
          </h3>
          
          <div className="w-20 h-1.5 bg-primary/20 dark:bg-accent/20 mx-auto mb-8 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary dark:bg-accent animate-infinite-slide"></div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed font-medium text-lg">
            The <span className="font-black text-slate-900 dark:text-white">{getModuleName()}</span> ecosystem is currently being integrated into the platform core. This module will handle advanced <span className="text-primary dark:text-accent font-black">{getModuleName().toLowerCase()} logic</span> for both clients and freelancers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { label: 'Core Logic', status: 'Optimizing', icon: 'settings' },
              { label: 'UI Layers', status: 'Refining', icon: 'palette' },
              { label: 'API Security', status: 'Hardening', icon: 'security' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="material-symbols-outlined text-slate-400 mb-2">{stat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-1">{stat.label}</span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">{stat.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
