const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, authorizeRole('ADMIN'), examController.createExam);
router.get('/', authenticateToken, examController.getAllExams);
router.get('/:id', authenticateToken, examController.getExamById);

module.exports = router;
