const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, chatController.chatWithAssistant);

module.exports = router;
