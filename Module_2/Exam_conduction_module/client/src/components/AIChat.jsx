import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AIChat = () => {
  const { sendMessageToAI, token, user, exams, generateAIQuestions } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your SkillCertify Assistant. How can I help you with your certifications today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  if (!token) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    const result = await sendMessageToAI(message, chatHistory.slice(1));
    
    setLoading(false);
    if (result && result.reply) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: result.reply }]);
      
      // Handle Auto-Generation Action
      if (result.action?.type === 'GENERATE_EXAM' && user?.role?.toUpperCase() === 'ADMIN') {
        const skillName = result.action.skillName.toLowerCase();
        
        // Robust skill search
        const allSkills = exams.map(e => e.skill).filter(Boolean);
        const skill = allSkills.find(s => 
          s.name?.toLowerCase().includes(skillName) || 
          skillName.includes(s.name?.toLowerCase())
        );
        
        if (skill) {
          setChatHistory(prev => [...prev, { role: 'assistant', text: `🚀 Initializing ${skill.name} exam generation for you...` }]);
          generateAIQuestions(skill.id, 5).then(res => {
            if (res && !res.error) {
              setChatHistory(prev => [...prev, { role: 'assistant', text: `✅ Success! Your new exam "${skill.name} AI Challenge" is now live on the Exams page.` }]);
            }
          });
        } else {
          setChatHistory(prev => [...prev, { role: 'assistant', text: "I'd love to help with that, but I couldn't find a matching skill in our database to generate a test for." }]);
        }
      }
    } else {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Chat Window */}
      {isOpen && (
        <div className="card glass-panel animate-scale-in" style={{ 
          width: '350px', 
          height: '500px', 
          marginBottom: '1rem', 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '1rem', 
            background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span style={{ fontWeight: 600 }}>AI Tutor Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(0, 23, 54, 0.7)',
                color: 'white',
                fontSize: '0.9rem',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask me anything..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ marginBottom: 0, height: '40px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem' }} disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          padding: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AIChat;
