const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { getMyBadges, getUserBadges } = require("../controllers/badge.controller");

router.get("/me", protect, getMyBadges);
router.get("/:userId", getUserBadges);

module.exports = router;
