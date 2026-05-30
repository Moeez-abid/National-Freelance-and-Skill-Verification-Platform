const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendOTP
} = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware");

// existing routes
router.post("/register", registerUser);
router.post("/login", loginUser);
// FORGOT PASSWORD
router.post("/forgot-password", requestPasswordReset);

// RESET PASSWORD
router.post("/reset-password", resetPassword);

// EMAIL VERIFICATION (OTP)
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
// NEW PROTECTED ROUTE
router.get("/me", protect, async (req, res) => {
  try {
    const pool = require("../config/db");
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_email_verified, p.profile_image_url 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User data fetched successfully ✅",
      user: userResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully ✅" });
});

const { changePassword } = require("../controllers/auth.controller");

router.post("/change-password", protect, changePassword);

module.exports = router;