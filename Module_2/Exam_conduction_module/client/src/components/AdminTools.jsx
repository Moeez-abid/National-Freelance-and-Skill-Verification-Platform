import React, { useState } from 'react';
import { Sparkles, Code2, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AdminTools = () => {
  const { exams, generateAIQuestions, generateCodingQuestions } = useAppContext();
  const [tab, setTab] = useState('mcq');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const uniqueSkills = Array.from(new Set(exams.map(e => JSON.stringify(e.skill))))
    .map(s => JSON.parse(s))
    .filter(s => s !== null);

  const handleGenerate = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    setSuccess(false);
    setMessage('');

    const fn = tab === 'coding' ? generateCodingQuestions : generateAIQuestions;
    const result = await fn(selectedSkill, count);

    setLoading(false);
    if (result && !result.error) {
      setSuccess(true);
      setMessage(result.message || 'Generated successfully!');
      setTimeout(() => setSuccess(false), 6000);
    } else {
      setMessage(result?.error || 'Failed to generate.');
    }
  };

  const tabStyle = (t) => ({
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: tab === t ? 'var(--primary)' : 'var(--bg-secondary)',
    color: tab === t ? 'white' : 'var(--text-muted)',
    transition: 'all 0.2s',
  });

  return (
    <div className="card glass-panel mb-8" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={22} style={{ color: 'var(--primary)' }} />
        <h3 style={{ margin: 0 }}>AI Question Generator (Admin Only)</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <button style={tabStyle('mcq')} onClick={() => { setTab('mcq'); setCount(5); }}>
          MCQ Questions
        </button>
        <button style={tabStyle('coding')} onClick={() => { setTab('coding'); setCount(3); }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code2 size={14} /> Coding Exercises
          </span>
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        {tab === 'mcq'
          ? 'Generate multiple-choice questions via Groq AI for a selected skill.'
          : 'Generate coding exercises graded automatically by AI when users submit their answers.'}
      </p>

      <div className="flex gap-4 items-end flex-wrap">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label">Target Skill</label>
          <select className="form-input" value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
            <option value="">Select a skill...</option>
            {uniqueSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '100px' }}>
          <label className="form-label">Count</label>
          <input
            type="number" className="form-input" value={count}
            onChange={e => setCount(parseInt(e.target.value))}
            min="1" max={tab === 'coding' ? 5 : 10}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedSkill}
          className="btn btn-primary flex items-center gap-2"
          style={{ height: '42px' }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (tab === 'coding' ? <Code2 size={18} /> : <Sparkles size={18} />)}
          {loading ? 'Generating...' : tab === 'coding' ? 'Generate Coding Exam' : 'Generate MCQ Exam'}
        </button>
      </div>

      {(success || message) && (
        <div className="mt-4 flex items-center gap-2 animate-fade-in" style={{ color: success ? 'var(--success)' : 'var(--danger)' }}>
          {success && <CheckCircle2 size={18} />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminTools;
