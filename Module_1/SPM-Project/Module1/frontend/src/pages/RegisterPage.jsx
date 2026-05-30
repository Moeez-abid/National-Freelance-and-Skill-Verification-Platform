import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    country: '',
    role: 'freelancer'
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match ❌', 'error');
    }

    setLoading(true);
    try {
      await register(formData);
      addToast('Registration successful! Check your email.', 'success');
      navigate('/verify-email', { state: { email: formData.email } });
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

      {/* Ambient background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 dark:bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-[500px] z-10 flex flex-col">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl transition-colors duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary dark:bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform">
              <span className="material-symbols-outlined text-white dark:text-primary text-3xl font-black">person_add</span>
            </div>
            <h1 className="text-3xl text-slate-900 dark:text-white font-black tracking-tighter uppercase">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Join Nexus Pro</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">First Name</label>
                <input 
                  type="text" 
                  name="first_name"
                  required
                  className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="last_name"
                  required
                  className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Work Email</label>
              <input 
                type="email" 
                name="email"
                required
                className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Confirm</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Phone Number</label>
                <input name="phone_number" className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50" placeholder="+1..." value={formData.phone_number} onChange={handleChange} />
              </div>
              <div>
                <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Country</label>
                <input name="country" className="input-field bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary dark:focus:border-accent/50" placeholder="USA" value={formData.country} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="section-label text-slate-500 dark:text-white/50 block ml-1">Account Type</label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, role: 'freelancer'}))}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === 'freelancer' 
                      ? 'bg-primary dark:bg-accent text-white dark:text-primary shadow-[0_0_15px_rgba(137,245,231,0.2)]' 
                      : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, role: 'client'}))}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === 'client' 
                      ? 'bg-primary dark:bg-accent text-white dark:text-primary shadow-[0_0_15px_rgba(137,245,231,0.2)]' 
                      : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, role: 'admin'}))}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === 'admin' 
                      ? 'bg-primary dark:bg-accent text-white dark:text-primary shadow-[0_0_15px_rgba(137,245,231,0.2)]' 
                      : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary py-4 mt-6 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center animate-fade-in delay-200">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-primary dark:text-accent hover:underline ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}