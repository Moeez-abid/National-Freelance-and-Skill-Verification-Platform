const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, skillController.getAllSkills);
router.post('/', authenticateToken, authorizeRole('ADMIN'), skillController.createSkill);
router.get('/:id', authenticateToken, skillController.getSkillById);

module.exports = router;
