import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamSession from './pages/ExamSession';
import AuthCallback from './pages/AuthCallback';

import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Navbar />
          <main style={{ padding: '2rem 0' }}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exam/:id" element={<ExamSession />} />
          </Routes>
        </main>
        <AIChat />
      </Router>
    </AppProvider>
    </ThemeProvider>
  );
}

export default App;

