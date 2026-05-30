const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");


const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      role,
      phone_number,
      country
    } = req.body;
    
    if (email) req.body.email = email.toLowerCase();
    const normalizedEmail = req.body.email;

    // =========================
    // 1. REQUIRED FIELDS CHECK
    // =========================
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }

    // =========================
    // 2. PASSWORD LENGTH CHECK
    // =========================
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    // =========================
    // 3. STRONG PASSWORD CHECK
    // (letters + numbers)
    // =========================
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 1 letter and 1 number"
      });
    }

    // =========================
    // 4. CONFIRM PASSWORD CHECK
    // =========================
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match ❌"
      });
    }

    // =========================
    // 5. CHECK EMAIL EXISTS
    // =========================
    const existingUser = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists ❌"
      });
    }

    // =========================
    // 6. HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // 7. INSERT USER
    // =========================
    const newUser = await pool.query(
      `INSERT INTO users 
      (first_name, last_name, email, password_hash, role, phone_number, country)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, email, role`,
      [
        first_name,
        last_name,
        normalizedEmail,
        hashedPassword,
        role,
        phone_number,
        country
      ]
    );

    // =========================
    // 8. CREATE PROFILE AUTOMATICALLY
    // =========================
    await pool.query(
      `INSERT INTO profiles (user_id) VALUES ($1)`,
      [newUser.rows[0].id]
    );

    // =========================
    // 9. GENERATE & SEND OTP
    // =========================
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await pool.query(
      `INSERT INTO verification_requests (user_id, verification_type, verification_status, document_url, expires_at)
       VALUES ($1, 'email', 'pending', $2, $3)`,
      [newUser.rows[0].id, otp, expiry]
    );

    console.log(`[TESTING] OTP for ${normalizedEmail} is: ${otp}`);

    try {
      await sendVerificationEmail(normalizedEmail, otp);
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
      // We don't block registration if email fails, but user will need to 'Resend'
    }

    return res.status(201).json({
      message: "User registered successfully ✅. Please check your email for the OTP.",
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password, rememberMe } = req.body;
    if (email) email = email.toLowerCase();

    // =========================
    // 1. CHECK USER EXISTS
    // =========================
    const userResult = await pool.query(
      `SELECT u.*, p.profile_image_url 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    const user = userResult.rows[0];

    // =========================
    // 2. CHECK PASSWORD
    // =========================
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    // =========================
    // 3. CHECK EMAIL VERIFIED
    // =========================
    if (!user.is_email_verified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in 📧",
        unverified: true 
      });
    }

    // =========================
    // 4. TOKEN EXPIRY (REMEMBER ME)
    // =========================
    const expiresIn = rememberMe ? "30d" : "1h";

    const token = jwt.sign(
      {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // =========================
    // 4. RESPONSE
    // =========================
    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        profile_image_url: user.profile_image_url,
        rememberMe: rememberMe || false
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old and new password are required"
      });
    }

    // get user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    const user = userResult.rows[0];

    // check old password
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // update DB
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({
      message: "Password changed successfully ✅"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const requestPasswordReset = async (req, res) => {
  let { email } = req.body;
  if (email) email = email.toLowerCase();

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (!user.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    `UPDATE users 
     SET reset_token=$1, reset_token_expiry=$2
     WHERE email=$3`,
    [token, expiry, email]
  );

  res.json({ message: "Reset token created", token });
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await pool.query(
      `SELECT * FROM users 
       WHERE reset_token=$1 
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if (!user.rows.length) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE users 
       SET password_hash=$1, reset_token=NULL, reset_token_expiry=NULL
       WHERE reset_token=$2`,
      [hashedPassword, token]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (email) email = email.toLowerCase();

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const userId = userResult.rows[0].id;

    const otpResult = await pool.query(
      `SELECT * FROM verification_requests 
       WHERE user_id = $1 AND verification_type = 'email' 
       AND document_url = $2 AND expires_at > NOW()
       ORDER BY requested_at DESC LIMIT 1`,
      [userId, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP ❌" });
    }

    await pool.query("UPDATE users SET is_email_verified = TRUE WHERE id = $1", [userId]);
    await pool.query("UPDATE verification_requests SET verification_status = 'verified', reviewed_at = NOW() WHERE id = $1", [otpResult.rows[0].id]);

    res.json({ message: "Email verified successfully! ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;
    if (email) email = email.toLowerCase();
    
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const userId = userResult.rows[0].id;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `INSERT INTO verification_requests (user_id, verification_type, verification_status, document_url, expires_at)
       VALUES ($1, 'email', 'pending', $2, $3)`,
      [userId, otp, expiry]
    );

    console.log(`[TESTING] New OTP for ${email} is: ${otp}`);

    await sendVerificationEmail(email, otp);
    res.json({ message: "A new OTP has been sent to your email ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendOTP
};
