const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/start', authenticateToken, testController.startAttempt);
router.post('/submit', authenticateToken, testController.submitAnswer);
router.post('/:id/complete', authenticateToken, testController.completeAttempt);

module.exports = router;
