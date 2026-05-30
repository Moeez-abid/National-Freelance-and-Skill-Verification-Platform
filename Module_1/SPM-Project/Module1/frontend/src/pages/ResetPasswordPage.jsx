import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return addToast('Passwords do not match', 'error');
    if (!token) return addToast('Invalid reset token', 'error');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      addToast('Password reset successfully! ✅', 'success');
      navigate('/login');
    } catch (err) {
      addToast('Failed to reset password ❌', 'error');
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

      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-[420px] z-10">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl transition-colors duration-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl text-slate-900 dark:text-white font-black tracking-tighter uppercase">New Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">Secure your professional workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="section-label block ml-1">New Password</label>
              <input 
                type="password" 
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="section-label block ml-1">Confirm Password</label>
              <input 
                type="password" 
                required
                className="input-field"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 mt-2">
              {loading ? 'Updating security...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
