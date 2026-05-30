import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Code, CheckCircle, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', margin: '4rem 0 6rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
          Validate Your Skills.<br/>Prove Your Expertise.
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Take industry-standard assessments, earn verified certifications, and unlock global freelancing opportunities with confidence.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/exams" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Explore Exams
          </Link>
          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            View My Progress
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 stagger-2">
        <div className="card glass-panel text-center">
          <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
            <Code size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h3>Technical Assessments</h3>
          <p>Rigorous coding and practical tests designed to push your limits and reflect real-world scenarios.</p>
        </div>
        
        <div className="card glass-panel text-center">
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
            <Award size={32} style={{ color: 'var(--success)' }} />
          </div>
          <h3>Verified Certifications</h3>
          <p>Earn robust certifications that hold weight and instantly communicate your mastery to employers.</p>
        </div>

        <div className="card glass-panel text-center">
          <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
            <Zap size={32} style={{ color: 'var(--warning)' }} />
          </div>
          <h3>Instant Feedback</h3>
          <p>Get immediate, automated scoring on your submissions to track your learning journey in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
