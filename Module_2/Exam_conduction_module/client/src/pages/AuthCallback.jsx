import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Full reload so AppContext picks up the new token from localStorage
      window.location.href = '/';
    } else {
      // No token provided, redirect to home
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="container animate-fade-in text-center" style={{ marginTop: '4rem' }}>
      <div className="card glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem' }}>
        <div className="animate-pulse" style={{ marginBottom: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }}></div>
        </div>
        <h3>Authenticating...</h3>
        <p style={{ color: 'var(--text-muted)' }}>Setting up your session</p>
      </div>
    </div>
  );
};

export default AuthCallback;
