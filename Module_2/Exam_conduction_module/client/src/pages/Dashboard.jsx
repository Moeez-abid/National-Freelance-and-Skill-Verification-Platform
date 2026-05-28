import React from 'react';
import { jsPDF } from 'jspdf';
import { Target, Award, Clock, Activity, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, MODULE1_LOGIN_URL } from '../context/AppContext';
import AdminTools from '../components/AdminTools';

const Dashboard = () => {
  const { userStats, user, token, logout } = useAppContext();
  const navigate = useNavigate();

  const downloadCertificate = (cert) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;
    const certId = `CERT-${String(cert.id).split('-')[0].toUpperCase()}`;
    const examTitle = cert.exam?.title || 'Skill Certificate';
    const issueDate = new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Background
    doc.setFillColor(249, 249, 255);
    doc.rect(0, 0, W, H, 'F');

    // Dark header band
    doc.setFillColor(0, 23, 54);
    doc.rect(0, 0, W, 38, 'F');

    // Teal accent strip
    doc.setFillColor(137, 245, 231);
    doc.rect(0, 36, W, 4, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLCERTIFY', 20, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(137, 245, 231);
    doc.text('OFFICIAL CERTIFICATE OF ACHIEVEMENT', 20, 26);

    // Cert ID badge (top right)
    doc.setFillColor(137, 245, 231);
    doc.roundedRect(W - 68, 8, 58, 18, 3, 3, 'F');
    doc.setTextColor(0, 23, 54);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE ID', W - 61, 16);
    doc.setFontSize(10);
    doc.text(certId, W - 61, 23);

    // Main title
    doc.setTextColor(0, 23, 54);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('THIS IS TO CERTIFY THAT', W / 2, 58, { align: 'center' });

    // Recipient name
    doc.setFontSize(32);
    doc.setTextColor(0, 23, 54);
    doc.text(user.name, W / 2, 80, { align: 'center' });

    // Underline for name
    doc.setDrawColor(137, 245, 231);
    doc.setLineWidth(1.2);
    doc.line(60, 84, W - 60, 84);

    // Body text
    doc.setFontSize(11);
    doc.setTextColor(87, 101, 116);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the required assessments and demonstrated proficiency in', W / 2, 96, { align: 'center' });

    // Exam title badge
    doc.setFillColor(0, 23, 54);
    doc.roundedRect(W / 2 - 70, 102, 140, 16, 4, 4, 'F');
    doc.setTextColor(137, 245, 231);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(examTitle, W / 2, 113, { align: 'center' });

    // Email & Date
    doc.setTextColor(87, 101, 116);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${user.email}`, W / 2, 130, { align: 'center' });
    doc.text(`Issued: ${issueDate}`, W / 2, 138, { align: 'center' });

    // Gold seal badge (circle)
    doc.setFillColor(245, 158, 11);
    doc.circle(W / 2, 163, 16, 'F');
    doc.setFillColor(0, 23, 54);
    doc.circle(W / 2, 163, 13, 'F');
    doc.setTextColor(137, 245, 231);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', W / 2, 161, { align: 'center' });
    doc.text('CERTIFIED', W / 2, 167, { align: 'center' });

    // Footer
    doc.setFillColor(0, 23, 54);
    doc.rect(0, H - 16, W, 16, 'F');
    doc.setTextColor(137, 245, 231);
    doc.setFontSize(8);
    doc.text(`SkillCertify © ${new Date().getFullYear()} — skillcertify.com`, W / 2, H - 6, { align: 'center' });

    doc.save(`${certId}_${user.name.replace(/\s+/g, '_')}.pdf`);
  };

  const isAdmin = user?.role === 'ADMIN';

  if (!token) {
    return (
      <div className="container animate-fade-in text-center mt-8">
        <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
        <h2>Authentication Required</h2>
        <p>Please login to view your progress.</p>
        <button onClick={() => window.location.href = MODULE1_LOGIN_URL} className="btn btn-primary mt-4">Go to Login</button>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="container text-center mt-8">
        <div className="animate-pulse" style={{ marginBottom: '1rem' }}>Loading your secure dashboard...</div>
        <button onClick={() => logout()} className="btn btn-secondary mt-4">Reset Session</button>
      </div>
    );
  }

  const recentAttempts = user.testAttempts || [];
  const certifications = user.certifications || [];

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p style={{ marginBottom: 0 }}>Here is your recent performance summary</p>
        </div>
        <button onClick={() => navigate('/exams')} className="btn btn-primary">
          Take a New Exam
        </button>
      </div>

      {isAdmin && <AdminTools />}

      <div className="grid grid-cols-4 stagger-1 mb-8">
        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Total Exams</span>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.totalAttempts}</h1>
        </div>
        
        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Passed</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.passedAttempts}</h1>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Certificates</span>
            <Award size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.certificationCount}</h1>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Badges earned</span>
            <Target size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.badgeCount}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 stagger-2">
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentAttempts.length > 0 ? recentAttempts.map(attempt => (
              <div key={attempt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{attempt.exam?.title}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(attempt.attemptDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`badge ${attempt.status?.toLowerCase() === 'passed' ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: '4px', background: attempt.status?.toLowerCase() === 'failed' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: attempt.status?.toLowerCase() === 'failed' ? '#fca5a5' : undefined }}>
                    {attempt.status?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{attempt.score} pts</div>
                </div>
              </div>
            )) : (
              <p className="text-center" style={{ color: 'var(--text-muted)' }}>No exam attempts yet.</p>
            )}
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">My Certifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {certifications.length > 0 ? certifications.map(cert => (
              <div key={cert.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.75rem', borderRadius: '12px' }}>
                  <Award size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{cert.exam?.title || 'Skill Certificate'}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>ID: CERT-{String(cert.id).split('-')[0].toUpperCase()}</p>
                </div>
                <button onClick={() => downloadCertificate(cert)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Download</button>
              </div>
            )) : (
              <div className="text-center" style={{ padding: '2rem 0' }}>
                <p>No certifications earned yet. Complete an exam to get certified!</p>
                <button onClick={() => navigate('/exams')} className="btn btn-secondary mt-2">Browse Exams</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
