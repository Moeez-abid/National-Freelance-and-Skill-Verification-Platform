const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const aiController = require('../controllers/aiController');

// Only ADMIN can create/manage questions
router.post('/', authenticateToken, authorizeRole('ADMIN'), questionController.createQuestion);
router.post('/generate-ai', authenticateToken, authorizeRole('ADMIN'), aiController.generateQuestions);
router.post('/generate-coding', authenticateToken, authorizeRole('ADMIN'), aiController.generateCodingQuestions);

router.post('/link-exam', authenticateToken, authorizeRole('ADMIN'), questionController.addQuestionToExam);
router.get('/', authenticateToken, questionController.getQuestions);

module.exports = router;
