import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password, rememberMe);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        // Cross-module redirect: send token to the requesting module
        window.location.href = `${redirectUrl}?token=${data.token}`;
        return;
      }
      addToast('Welcome back to Nexus Pro!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary dark:hover:text-accent transition-all z-50 hover:scale-110"
      >
        <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
      </button>

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(137,245,231,0.3)]">
              <span className="material-symbols-outlined text-primary font-black">bolt</span>
            </div>
            <h1 className="text-2xl text-slate-900 dark:text-white font-black tracking-tighter">NEXUS PRO</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Professional Identity Management</p>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl transition-colors duration-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Work Email</label>
              <input 
                type="email" 
                required
                className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-accent/50"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Password</label>
                <Link to="/forgot-password" name="forgot-password" id="forgot-password" className="text-[10px] font-black uppercase tracking-label text-accent hover:underline">Forgot?</Link>
              </div>
              <input 
                type="password" 
                required
                className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-accent/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="remember"
                className="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-accent focus:ring-accent/50"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-xs text-slate-500 dark:text-white/60 font-medium select-none">Remember this session</label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full btn-primary py-4 relative overflow-hidden group ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Sign in to workspace</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-400 text-xs font-medium">
              New to the platform? <Link to="/register" className="text-accent font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}