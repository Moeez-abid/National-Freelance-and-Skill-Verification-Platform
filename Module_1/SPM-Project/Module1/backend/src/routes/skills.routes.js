const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const { getAllSkills, addUserSkill, getUserSkills, updateUserSkill,deleteUserSkill,createSkillBadge} = require("../controllers/skills.controller");
router.get("/user", protect, getUserSkills);
// PUBLIC
router.get("/", getAllSkills);

// PROTECTED (freelancers only)
router.post(
  "/user",
  protect,
  allowRoles("freelancer"),
  addUserSkill
);

router.put(
  "/user/:skillId",
  protect,
  allowRoles("freelancer"),
  updateUserSkill
);

router.delete(
  "/user/:skillId",
  protect,
  allowRoles("freelancer"),
  deleteUserSkill
);

router.post("/badge", protect, allowRoles("freelancer"), createSkillBadge);
module.exports = router;