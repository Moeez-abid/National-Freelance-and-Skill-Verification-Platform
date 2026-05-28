require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Skill Testing & Certification Module API is running' });
});

// Import routes

const skillRoutes = require('./routes/skillRoutes');
const examRoutes = require('./routes/examRoutes');
const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Use routes

app.use('/api/exam-conduction/skills', skillRoutes);
app.use('/api/exam-conduction/exams', examRoutes);
app.use('/api/exam-conduction/tests', testRoutes);
app.use('/api/exam-conduction/questions', questionRoutes);
app.use('/api/exam-conduction/users', userRoutes);
app.use('/api/exam-conduction/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
