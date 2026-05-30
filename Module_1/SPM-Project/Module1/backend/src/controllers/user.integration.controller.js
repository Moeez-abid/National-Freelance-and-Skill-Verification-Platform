const pool = require("../config/db");


// =========================
// 1. BASIC USER INFO
// =========================
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, country, is_identity_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


// =========================
// 2. PROFILE INFO (FOR AI MATCHING)
// =========================
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


// =========================
// 3. SKILLS (MARKETPLACE)
// =========================
const getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT s.*
       FROM skills s
       JOIN user_skills us ON s.id = us.skill_id
       WHERE us.user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      skills: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


// =========================
// 4. TRUST SCORE (PAYMENT)
// =========================
const getUserTrust = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT trust_score, tier_level, average_rating, total_reviews
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      trust: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


// =========================
// 5. VERIFICATION STATUS
// =========================
const getUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT is_identity_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      verified: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


// =========================
// 6. SEARCH USERS
// =========================
const searchUsers = async (req, res) => {
  try {
    const { role, q, skill } = req.query;

    let query = `
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.email, u.role, u.country, u.is_identity_verified, u.account_status,
        p.headline, p.profile_image_url, p.hourly_rate, p.average_rating, p.total_reviews, p.trust_score, p.tier_level
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
    `;
    const params = [];
    const conditions = [];

    if (role) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }

    // GENERAL SEARCH (Name, Headline, Skill)
    if (q) {
      params.push(`%${q}%`);
      const searchParam = `$${params.length}`;
      conditions.push(`(
        u.first_name ILIKE ${searchParam} OR 
        u.last_name ILIKE ${searchParam} OR 
        p.headline ILIKE ${searchParam} OR 
        s.skill_name ILIKE ${searchParam}
      )`);
    }

    // SPECIFIC SKILL FILTER
    if (skill) {
      params.push(`%${skill}%`);
      conditions.push(`s.skill_name ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY u.id DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      users: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// =========================
// 7. DASHBOARD STATS
// =========================
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { role } = req.user;

    let stats = {};

    if (role === 'freelancer') {
      const result = await pool.query(
        `SELECT trust_score, tier_level, average_rating, total_reviews, profile_image_url
         FROM profiles WHERE user_id = $1`,
        [userId]
      );
      stats = result.rows[0] || {};
    } else if (role === 'client') {
      // For client, we can count how many reviews they've given and the average
      const result = await pool.query(
        `SELECT COUNT(*) as reviews_given, AVG(rating)::numeric(10,1) as avg_rating_given 
         FROM reviews WHERE reviewer_id = $1`,
        [userId]
      );
      stats = {
        reviews_given: parseInt(result.rows[0]?.reviews_given || 0),
        avg_rating_given: result.rows[0]?.avg_rating_given || '0.0'
      };
    } else if (role === 'admin') {
      const userCount = await pool.query("SELECT COUNT(*) FROM users");
      const pendingIdentity = await pool.query("SELECT COUNT(*) FROM verification_requests WHERE verification_status = 'pending'");
      const pendingCerts = await pool.query("SELECT COUNT(*) FROM certifications WHERE verification_status = 'pending'");
      
      stats = {
        total_users: parseInt(userCount.rows[0]?.count || 0),
        pending_verifications: parseInt(pendingIdentity.rows[0]?.count || 0) + parseInt(pendingCerts.rows[0]?.count || 0),
        pending_identity: parseInt(pendingIdentity.rows[0]?.count || 0),
        pending_certifications: parseInt(pendingCerts.rows[0]?.count || 0)
      };
    }

    res.json({
      success: true,
      stats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// =========================
// 8. UPDATE USER STATUS (ADMIN)
// =========================
const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required ❌" });
    }

    const { userId } = req.params;
    const { account_status } = req.body;

    const validStatuses = ['active', 'suspended', 'banned'];
    if (!validStatuses.includes(account_status)) {
      return res.status(400).json({ message: "Invalid status. Must be active, suspended, or banned." });
    }

    const result = await pool.query(
      `UPDATE users SET account_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, first_name, last_name, email, role, account_status`,
      [account_status, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User status updated ✅", user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

module.exports = {
  getUserById,
  getUserProfile,
  getUserSkills,
  getUserTrust,
  getUserVerification,
  searchUsers,
  getDashboardStats,
  updateUserStatus
};