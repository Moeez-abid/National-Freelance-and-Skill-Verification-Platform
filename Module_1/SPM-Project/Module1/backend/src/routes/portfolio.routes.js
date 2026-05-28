const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
  getMyPortfolio,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  toggleFeatured,
  reorderProjects
} = require("../controllers/portfolio.controller");

const upload = require("../utils/upload");

// -----------------------------
// GET MY PORTFOLIO
// -----------------------------
router.get("/", auth, getMyPortfolio);

// -----------------------------
// CREATE PROJECT (FREELANCER ONLY)
// -----------------------------
router.post(
  "/",
  auth,
  allowRoles("freelancer"),
  createProject
);

// -----------------------------
// UPDATE PROJECT (FREELANCER ONLY)
// -----------------------------
router.put(
  "/:projectId",
  auth,
  allowRoles("freelancer"),
  updateProject
);

// -----------------------------
// DELETE PROJECT (FREELANCER ONLY)
// -----------------------------
router.delete(
  "/:projectId",
  auth,
  allowRoles("freelancer"),
  deleteProject
);

// -----------------------------
// UPLOAD IMAGE (FREELANCER ONLY)
// -----------------------------
router.post(
  "/:projectId/upload-image",
  auth,
  allowRoles("freelancer"),
  upload.single("image"),
  uploadProjectImage
);

// -----------------------------
// TOGGLE FEATURED PROJECT
// -----------------------------
router.patch(
  "/:projectId/featured",
  auth,
  allowRoles("freelancer"),
  toggleFeatured
);

router.put(
  "/reorder",
  auth,
  allowRoles("freelancer"),
  reorderProjects
);
module.exports = router;