import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { useAppContext, API_URL } from '../context/AppContext';

const ExamSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startExamAttempt, submitAnswer, completeExamAttempt, user, token } = useAppContext();
  
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const calledRef = React.useRef(false);

  const initExam = async () => {
    if (!token || !user || calledRef.current) return;
    calledRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_URL}/exams/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const examData = await res.json();
      
      if (!res.ok) throw new Error('Failed to fetch exam details');
      
      setExam(examData);
      setTimeLeft((examData.duration || 30) * 60);

      const attemptRes = await startExamAttempt(id);
      if (attemptRes && attemptRes.id) {
        setAttempt(attemptRes);
      } else {
        throw new Error(attemptRes?.error || 'Failed to start exam session');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = `http://localhost:3000/login?redirect=${encodeURIComponent('http://localhost:5173/auth/callback')}`;
      return;
    }
    
    if (user) {
      initExam();
    }
  }, [id, token, user]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted || !attempt) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, attempt]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = async () => {
    const currentQuestion = exam.questions[currentQuestionIdx]?.question;
    if (!attempt || !currentQuestion) return;
    const isCoding = currentQuestion.type === 'CODING';
    const answer = isCoding ? codeAnswer : selectedAnswer;
    if (!answer?.trim()) return;

    setSubmittingAnswer(true);
    setAiFeedback(null);
    try {
      const res = await fetch(`${API_URL}/tests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ attemptId: attempt.id, questionId: currentQuestion.id, givenAnswer: answer }),
      });
      const data = await res.json();
      if (isCoding && data.aiFeedback) {
        setAiFeedback(data.aiFeedback);
        await new Promise(r => setTimeout(r, 2500)); // brief pause to show feedback
      }
    } catch (e) { console.error(e); }
    setSubmittingAnswer(false);

    if (currentQuestionIdx < exam.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setCodeAnswer('');
      setAiFeedback(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    const result = await completeExamAttempt(attempt.id);
    if (result && result.error) {
      setError(result.error);
    } else {
      setFinalResult(result);
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (loading || (!exam && !error)) {
    return (
      <div className="container flex flex-column justify-center items-center" style={{ minHeight: '50vh' }}>
        <Loader2 size={48} className="animate-spin mb-4" style={{ color: 'var(--primary)' }} />
        <p>Loading your exam session...</p>
      </div>
    );
  }

  if (error || !exam || !attempt || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="container text-center mt-8 animate-fade-in">
        <AlertCircle size={64} style={{ color: 'var(--danger)', marginBottom: '1.5rem' }} />
        <h2>Exam Not Ready</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
          {error || "This exam is either empty or could not be started."}
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/exams')} className="btn btn-secondary">
            Back to Exams
          </button>
          <button onClick={initExam} className="btn btn-primary flex items-center gap-2">
            <RefreshCcw size={18} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (submitted && finalResult) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
          {finalResult.status?.toUpperCase() === 'PASSED' ? (
            <CheckCircle size={80} style={{ color: 'var(--success)', margin: '0 auto 1.5rem' }} />
          ) : (
            <AlertCircle size={80} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem' }} />
          )}
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {finalResult.status?.toUpperCase() === 'PASSED' ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <h2 style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {finalResult.status?.toUpperCase() === 'PASSED' ? 'You have passed the exam.' : 'You did not meet the passing score.'}
          </h2>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p style={{ margin: 0 }}>Your Score</p>
              <h1 style={{ fontSize: '3rem', margin: 0, color: finalResult.status?.toUpperCase() === 'PASSED' ? 'var(--success)' : 'var(--danger)' }}>
                {finalResult.score}
              </h1>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }}></div>
            <div>
              <p style={{ margin: 0 }}>Passing Requirement</p>
              <h1 style={{ fontSize: '3rem', margin: 0, color: 'var(--text-muted)' }}>
                {exam.passingScore}
              </h1>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }}></div>
            <div>
              <p style={{ margin: 0 }}>Status</p>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{finalResult.status}</h1>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/exams')}>
              More Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionRecord = exam.questions[currentQuestionIdx];
  const currentQuestion = currentQuestionRecord ? currentQuestionRecord.question : null;

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="badge badge-primary mb-2">{exam.skill?.name} Assessment</span>
          <h2>{exam.title}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--warning)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'monospace', color: timeLeft < 300 ? 'var(--danger)' : 'black' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="card glass-panel mb-6">
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentQuestionIdx + 1} of {exam.questions.length}
          </span>
          <h3 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{currentQuestion.text}</h3>
        </div>

        {currentQuestion.type === 'CODING' ? (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Write your code or solution below:</p>
            <textarea
              value={codeAnswer}
              onChange={e => setCodeAnswer(e.target.value)}
              placeholder="// Write your code here..."
              style={{
                width: '100%', minHeight: '200px', padding: '1rem',
                background: '#f8f9ff', border: '1px solid var(--border)',
                borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.95rem',
                color: 'var(--text-main)', resize: 'vertical', outline: 'none',
                lineHeight: 1.6,
              }}
            />
            {aiFeedback && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(44,163,151,0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.9rem' }}>
                🤖 AI Feedback: {aiFeedback}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 stagger-1">
            {currentQuestion.options?.map((opt, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '1rem 1.5rem',
                  border: `1px solid ${selectedAnswer === opt ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  background: selectedAnswer === opt ? 'rgba(0,23,54,0.07)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s ease', marginBottom: '0.75rem'
                }}
              >
                <input
                  type="radio" name="quiz_option"
                  checked={selectedAnswer === opt}
                  onChange={() => setSelectedAnswer(opt)}
                  style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>{opt}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button 
          className="btn btn-secondary"
          onClick={() => { if(window.confirm('Are you sure you want to cancel? Progress will be lost.')) navigate('/exams'); }}
        >
          Cancel Exam
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={submittingAnswer || (currentQuestion.type === 'CODING' ? !codeAnswer.trim() : !selectedAnswer)}
          style={{ opacity: (submittingAnswer || (currentQuestion.type === 'CODING' ? !codeAnswer.trim() : !selectedAnswer)) ? 0.5 : 1, minWidth: '160px' }}
        >
          {submittingAnswer ? <><Loader2 size={16} className="animate-spin" /> Grading...</> : (currentQuestionIdx < exam.questions.length - 1 ? 'Next Question' : 'Submit Exam')}
        </button>
      </div>
    </div>
  );
};

export default ExamSession;
