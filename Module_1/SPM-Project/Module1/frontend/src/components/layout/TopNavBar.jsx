import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../services/api';

export default function TopNavBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = React.useState(false);

  const openGigMarketplace = () => {
    const token = localStorage.getItem('token');
    window.location.href = `http://localhost:5003/gig-marketplace${token ? `?token=${token}` : ''}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary dark:bg-surface-container-dark text-white z-50 flex items-center px-6 border-b border-white/5">
      <div className="flex items-center gap-4 w-64">
        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl font-bold">bolt</span>
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tighter leading-none">NEXUS PRO</h1>
          <p className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none mt-1">Professional</p>
        </div>
      </div>



      <nav className="hidden xl:flex items-center gap-8 ml-10">
        <button
          onClick={openGigMarketplace}
          className="text-[11px] font-black uppercase tracking-widest text-slate-300 border-b-2 border-transparent pb-1 hover:text-white transition-colors"
        >
          Gig Marketplace
        </button>
      </nav>

      <div className="flex items-center gap-3 ml-auto">
        <button onClick={openGigMarketplace} className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Gig Marketplace" aria-label="Gig Marketplace">
          <span className="material-symbols-outlined">storefront</span>
        </button>

        <button onClick={toggleTheme} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Toggle theme" aria-label="Toggle theme">
          <span className="material-symbols-outlined text-xl">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 text-slate-300 hover:text-white rounded-full flex items-center justify-center relative transition-all ${showNotifications ? 'bg-white/20 text-white' : 'hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-primary"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-container-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</h3>
                  <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">New</span>
                </div>
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-slate-200 dark:text-white/5 text-5xl mb-3">notifications_off</span>
                  <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-tight">All caught up!</p>
                  <p className="text-slate-400 text-[10px] font-medium mt-1">No new notifications at this time.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] text-center border-t border-slate-100 dark:border-white/5">
                  <button className="text-[9px] font-black uppercase tracking-widest text-primary dark:text-accent hover:underline">View Notification History</button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-tight">
              {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'User Profile'}
            </p>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{user?.role || 'Freelancer'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
            {user?.profile_image_url ? (
              <img 
                src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${BASE_URL}${user.profile_image_url}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${user?.first_name || 'U'}+${user?.last_name || ''}&background=random`} alt="avatar" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
