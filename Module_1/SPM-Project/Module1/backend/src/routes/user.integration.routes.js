const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUserProfile,
  getUserSkills,
  getUserTrust,
  getUserVerification,
  searchUsers,
  getDashboardStats,
  updateUserStatus
} = require("../controllers/user.integration.controller");

const protect = require("../middleware/auth.middleware");

// BASIC USER
router.get("/me/stats", protect, getDashboardStats);
router.get("/:userId", getUserById);

// PROFILE
router.get("/:userId/profile", getUserProfile);

// SKILLS
router.get("/:userId/skills", getUserSkills);

// TRUST SCORE
router.get("/:userId/trust", getUserTrust);

// VERIFIED
router.get("/:userId/verified", getUserVerification);

// SEARCH
router.get("/search/all", searchUsers);

// ADMIN: UPDATE USER STATUS
router.patch("/:userId/status", protect, updateUserStatus);

module.exports = router;