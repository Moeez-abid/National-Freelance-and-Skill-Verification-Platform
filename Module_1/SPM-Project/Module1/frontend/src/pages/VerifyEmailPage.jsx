import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      addToast('Session expired. Please register again.', 'error');
      navigate('/register');
    }
  }, [email]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, otp: otp.join('') });
      addToast('Email verified successfully! ✅', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    try {
      await api.post('/auth/resend-otp', { email });
      addToast('New OTP sent!', 'success');
    } catch (err) {
      addToast('Failed to resend OTP', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-accent transition-all z-50 hover:scale-110"
      >
        <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
      </button>

      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="w-full max-w-[420px] z-10">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-10 rounded-2xl shadow-2xl text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
              <span className="material-symbols-outlined text-primary text-3xl font-black">mail</span>
            </div>
            <h1 className="text-2xl text-slate-900 dark:text-white font-black tracking-tighter uppercase">Verify Your Email</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">We've sent a 6-digit code to <br/><span className="text-primary dark:text-accent font-black">{email}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-center text-xl font-black text-slate-900 dark:text-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all"
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !data && e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-4">
              {loading ? 'Verifying...' : 'Validate Code'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Didn't receive the code?</p>
            {resendTimer > 0 ? (
              <p className="text-slate-500 dark:text-white/40 text-xs font-bold">Resend available in {resendTimer}s</p>
            ) : (
              <button onClick={handleResend} className="text-primary dark:text-accent font-black text-xs uppercase tracking-widest hover:underline">Resend OTP Now</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
