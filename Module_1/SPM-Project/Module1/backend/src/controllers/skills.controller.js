const db = require("../config/db");

// ✅ GET ALL SKILLS
const getAllSkills = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, skill_name, category
      FROM skills
      WHERE is_active = TRUE
      ORDER BY skill_name ASC
    `);

    res.status(200).json({
      success: true,
      skills: result.rows
    });

  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch skills"
    });
  }
};

// ✅ ADD SKILL TO LOGGED-IN USER
const addUserSkill = async (req, res) => {
  try {
    // 🔐 get user from auth middleware
    const userId = req.user.id || req.user.userId;
    const {
      skill_id,
      skill_level,
      years_of_experience,
      is_certified,
      verified_by_test,
      test_score
    } = req.body;

    // 🔴 VALIDATION
    if (!skill_id) {
      return res.status(400).json({
        success: false,
        message: "skill_id is required"
      });
    }

    // 🔴 CHECK DUPLICATE
    const existing = await db.query(
      `SELECT 1 FROM user_skills WHERE user_id = $1 AND skill_id = $2`,
      [userId, skill_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Skill already added"
      });
    }

    // 🟢 INSERT INTO user_skills
    const result = await db.query(
      `INSERT INTO user_skills 
      (user_id, skill_id, skill_level, years_of_experience, is_certified, verified_by_test, test_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        userId,
        skill_id,
        skill_level || "intermediate",
        years_of_experience || 0,
        is_certified || false,
        verified_by_test || false,
        test_score || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Skill added successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add skill"
    });
  }
};

const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const result = await db.query(
      `
      SELECT
        us.id,
        us.skill_id,
        s.skill_name,
        s.category,
        us.skill_level,
        us.years_of_experience,
        us.is_certified,
        us.verified_by_test,
        us.test_score
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      skills: result.rows
    });

  } catch (error) {
    console.error("Get user skills error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user skills"
    });
  }
};

const updateUserSkill = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const skillId = req.params.skillId;

    const {
      skill_level,
      years_of_experience,
      is_certified,
      verified_by_test,
      test_score
    } = req.body;

    const result = await db.query(
      `
      UPDATE user_skills
      SET 
        skill_level = COALESCE($1, skill_level),
        years_of_experience = COALESCE($2, years_of_experience),
        is_certified = COALESCE($3, is_certified),
        verified_by_test = COALESCE($4, verified_by_test),
        test_score = COALESCE($5, test_score),
        updated_at = NOW()
      WHERE user_id = $6 AND skill_id = $7
      RETURNING *
      `,
      [
        skill_level,
        years_of_experience,
        is_certified,
        verified_by_test,
        test_score,
        userId,
        skillId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found ❌"
      });
    }

    res.json({
      success: true,
      message: "Skill updated successfully ✅",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error ❌"
    });
  }
};

const deleteUserSkill = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const skillId = req.params.skillId;

    const result = await db.query(
      `
      DELETE FROM user_skills
      WHERE user_id = $1 AND skill_id = $2
      RETURNING *
      `,
      [userId, skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found ❌"
      });
    }

    res.json({
      success: true,
      message: "Skill deleted successfully ✅"
    });

  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error ❌"
    });
  }
};

const pool = require("../config/db");

const createSkillBadge = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const {
      skill_id,
      badge_name,
      level,
      certificate_url
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO skill_badges 
      (user_id, skill_id, badge_name, level, certificate_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        userId,
        skill_id,
        badge_name,
        level || "intermediate",
        certificate_url || null
      ]
    );

    res.json({
      success: true,
      message: "Badge created successfully 🏅",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error ❌"
    });
  }
};

module.exports = {
  getAllSkills,
  addUserSkill,
  getUserSkills,
  updateUserSkill,
  deleteUserSkill,
  createSkillBadge  
};