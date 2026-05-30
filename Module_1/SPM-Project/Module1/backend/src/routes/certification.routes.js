const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
  getCertifications,
  createCertification,
  verifyCertification,
  updateCertification,
  deleteCertification,
  getAllCertifications
} = require("../controllers/certification.controller");

const upload = require("../utils/upload");

// PUBLIC VIEW
router.get("/:userId", getCertifications);

// FREELANCER ACTIONS
router.post(
  "/",
  auth,
  allowRoles("freelancer"),
  upload.single("certificate"),
  createCertification
);

router.put(
  "/:certId",
  auth,
  allowRoles("freelancer"),
  updateCertification
);

router.delete(
  "/:certId",
  auth,
  allowRoles("freelancer", "admin", "moderator"),
  deleteCertification
);

router.patch(
  "/:certId/verify",
  auth,
  allowRoles("admin", "moderator"),
  verifyCertification
);

router.get(
  "/admin/all",
  auth,
  allowRoles("admin", "moderator"),
  getAllCertifications
);

module.exports = router;