import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScrollText, LogOut, LogIn, Moon, Sun, Zap, Home } from 'lucide-react';
import { useAppContext, MODULE1_LOGIN_URL } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { token, logout, user } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand like Module 1 */}
        <div className="nav-brand-container">
          <div className="nav-brand-icon">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="nav-brand-text">
            <h1>NEXUS PRO</h1>
            <p>Professional</p>
          </div>
        </div>

        <div className="nav-links">
          {/* Link back to Module 1 Dashboard */}
          <a href="http://localhost:3000/dashboard" className="nav-link">
            <Home size={16} /> Home
          </a>
          <Link to="/exams" className={`nav-link ${isActive('/exams')}`}>
            <ScrollText size={16} /> Exams
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {token ? (
            <div className="nav-profile">
              <div className="nav-profile-text">
                <p className="nav-profile-name">{user?.name || 'User Profile'}</p>
                <p className="nav-profile-role">Freelancer</p>
              </div>
              <div className="nav-avatar">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt="avatar" />
              </div>
              <button onClick={logout} className="theme-toggle" style={{ marginLeft: '0.5rem' }} aria-label="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => window.location.href = MODULE1_LOGIN_URL} className="btn btn-primary" style={{ padding: '0.4rem 1rem', background: '#89f5e7', color: '#001736' }}>
                <LogIn size={16} /> Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
