const pool = require("../config/db");

const getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    u.id,
    u.first_name || ' ' || u.last_name AS name,
    u.is_identity_verified,
    p.trust_score,
    p.tier_level,
    p.average_rating,
    p.total_reviews,
    p.profile_image_url
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  WHERE u.role = 'freelancer'
  ORDER BY 
    p.trust_score DESC,
    p.average_rating DESC
  LIMIT 50
`);

    res.json({
      success: true,
      leaderboard: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

module.exports = { getLeaderboard };