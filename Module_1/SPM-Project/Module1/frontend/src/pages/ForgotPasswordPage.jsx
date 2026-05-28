import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      addToast('Reset link sent to your email! ✅', 'success');
    } catch (err) {
      addToast('Failed to send reset link ❌', 'error');
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

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="w-full max-w-[420px] z-10">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-4xl text-accent mb-4">lock_reset</span>
            <h1 className="text-2xl text-slate-900 dark:text-white font-black tracking-tighter uppercase">Reset Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">Enter your email to receive a recovery link</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="section-label block ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="input-field"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-4">
                {loading ? 'Sending link...' : 'Send Recovery Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-900 dark:text-white font-bold mb-4">Check your inbox!</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">If an account exists for {email}, you will receive instructions shortly.</p>
              <button onClick={() => setSent(false)} className="btn-ghost">Try another email</button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 text-center">
            <Link to="/login" className="text-primary dark:text-accent font-black text-xs uppercase tracking-widest hover:underline">Return to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
