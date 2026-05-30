import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Award, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { useAppContext, MODULE1_LOGIN_URL } from '../context/AppContext';

const ExamList = () => {
  const navigate = useNavigate();
  const { exams, token } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return (
      <div className="container animate-fade-in text-center mt-8">
        <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
        <h2>Authentication Required</h2>
        <p>Please login to view and start exams.</p>
        <button onClick={() => window.location.href = MODULE1_LOGIN_URL} className="btn btn-primary mt-4">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Available Exams</h2>
          <p style={{ marginBottom: 0 }}>Challenge yourself and earn recognized certifications</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search exams..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 stagger-1">
        {filteredExams.length > 0 ? filteredExams.map(exam => (
          <div key={exam.id} className="card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-primary">{exam.skill?.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <BookOpen size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {exam.questions?.length || 0} Questions
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{exam.title}</h3>
              <p style={{ marginBottom: '1rem', maxWidth: '800px' }}>{exam.description}</p>
              
              <div className="flex gap-4">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Clock size={16} style={{ marginRight: '6px' }} />
                  {exam.duration} mins
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Award size={16} style={{ marginRight: '6px' }} />
                  Passing Score: {exam.passingScore} / {exam.totalPoints || 0} pts 
                  {exam.totalPoints > 0 ? ` (${Math.round((exam.passingScore / exam.totalPoints) * 100)}%)` : ''}
                </span>
              </div>
            </div>
            
            <div style={{ paddingLeft: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}
                onClick={() => navigate(`/exam/${exam.id}`)}
              >
                Start Exam <ChevronRight size={18} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center mt-8">
            <p>No exams found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
