const pool = require("../config/db");

const getMyBadges = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        b.badge_name, 
        b.badge_description, 
        b.badge_icon_url,
        b.category,
        ub.awarded_at
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.awarded_at DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Get badges error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.badge_name, 
        b.badge_description, 
        b.badge_icon_url,
        b.category,
        ub.awarded_at
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.awarded_at DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Get user badges error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyBadges,
  getUserBadges
};
