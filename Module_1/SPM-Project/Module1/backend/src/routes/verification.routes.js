const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  submitVerificationRequest,
  getUserRequests,
  reviewRequest,
  getAllVerificationRequests
} = require("../controllers/verification.controller");

// USER
router.post(
  "/request",
  auth,
  upload.single("document"),
  submitVerificationRequest
);

// ADMIN (must come before /:userId to avoid shadowing)
router.get("/admin/all", auth, getAllVerificationRequests);

router.get("/:userId", auth, getUserRequests);
router.patch("/review/:requestId", auth, reviewRequest);

module.exports = router;