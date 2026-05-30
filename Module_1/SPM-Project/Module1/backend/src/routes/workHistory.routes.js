const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
  getWorkHistory,
  createWorkHistory,
  updateWorkHistory,
  deleteWorkHistory
} = require("../controllers/workHistory.controller");

// GET (public)
router.get("/:userId", getWorkHistory);

// CREATE (freelancer only)
router.post("/", auth, allowRoles("freelancer"), createWorkHistory);

// UPDATE (freelancer only)
router.put("/:entryId", auth, allowRoles("freelancer"), updateWorkHistory);

// DELETE (freelancer only)
router.delete("/:entryId", auth, allowRoles("freelancer"), deleteWorkHistory);

module.exports = router;