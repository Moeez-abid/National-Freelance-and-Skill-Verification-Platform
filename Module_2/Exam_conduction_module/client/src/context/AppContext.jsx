import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
export const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/exam-conduction` 
  : 'http://localhost:5002/api/exam-conduction';

// Cross-module auth: redirect to Module 1 login with callback to Module 2
export const MODULE1_LOGIN_URL = `http://localhost:3000/login?redirect=${encodeURIComponent('http://localhost:5173/auth/callback')}`;

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userStats, setUserStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchExams();
    }
  }, [token]);

  // Login is handled in Module 1

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserStats(null);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExams(data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    }
  };

  const startExamAttempt = async (examId) => {
    try {
      const res = await fetch(`${API_URL}/tests/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, examId }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to start attempt', err);
    }
  };

  const submitAnswer = async (attemptId, questionId, givenAnswer) => {
    try {
      await fetch(`${API_URL}/tests/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId, questionId, givenAnswer }),
      });
    } catch (err) {
      console.error('Failed to submit answer', err);
    }
  };

  const completeExamAttempt = async (attemptId) => {
    try {
      const res = await fetch(`${API_URL}/tests/${attemptId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      fetchProfile();
      return data;
    } catch (err) {
      console.error('Failed to complete attempt', err);
    }
  };

  const generateCodingQuestions = async (skillId, count = 3) => {
    try {
      const res = await fetch(`${API_URL}/questions/generate-coding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skillId, count }),
      });
      if (res.ok) fetchExams();
      return await res.json();
    } catch (err) {
      console.error('Failed to generate coding questions', err);
    }
  };

  const generateAIQuestions = async (skillId, count = 5) => {
    try {
      const res = await fetch(`${API_URL}/questions/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skillId, count }),
      });
      if (res.ok) fetchExams();
      return await res.json();
    } catch (err) {
      console.error('Failed to generate AI questions', err);
    }
  };

  const sendMessageToAI = async (message, history = []) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, history }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to send message to AI', err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, token, userStats, exams, loading,
      logout, startExamAttempt, submitAnswer, completeExamAttempt, generateAIQuestions, generateCodingQuestions, sendMessageToAI 
    }}>
      {children}
    </AppContext.Provider>
  );
};
