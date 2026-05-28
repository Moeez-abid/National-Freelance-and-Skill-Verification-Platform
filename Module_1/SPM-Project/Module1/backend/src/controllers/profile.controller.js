const pool = require("../config/db");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const paramId = req.params.userId;

    // ---------------------------
    // 1. OWNERSHIP CHECK
    // ---------------------------
    if (Number(userId) !== Number(paramId)) {
      return res.status(403).json({
        message: "You can only update your own profile ❌"
      });
    }

    // ---------------------------
    // 2. GET USER ROLE
    // ---------------------------
    const userResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found ❌"
      });
    }

    const role = userResult.rows[0].role;

    // ---------------------------
    // 3. EXTRACT INPUT
    // ---------------------------
    const {
      headline,
      bio,
      location,
      hourly_rate,
      experience_years,
      availability_status
    } = req.body;

    // ---------------------------
    // 4. ROLE-BASED FIELD CONTROL
    // ---------------------------
    let updatedData = {
      headline: null,
      bio: null,
      location: null,
      hourly_rate: null,
      experience_years: null,
      availability_status: null
    };

    if (role === "freelancer") {
      updatedData = {
        headline,
        bio,
        location,
        hourly_rate,
        experience_years,
        availability_status
      };
    } else if (role === "client" || role === "admin") {
      updatedData = {
        location,
        bio
      };
    }

    // ---------------------------
    // 5. UPDATE QUERY
    // ---------------------------
    const result = await pool.query(
      `
      UPDATE profiles
      SET 
        headline = COALESCE($1, headline),
        bio = COALESCE($2, bio),
        location = COALESCE($3, location),
        hourly_rate = COALESCE($4, hourly_rate),
        experience_years = COALESCE($5, experience_years),
        availability_status = COALESCE($6, availability_status),
        updated_at = NOW()
      WHERE user_id = $7
      RETURNING *
      `,
      [
        updatedData.headline,
        updatedData.bio,
        updatedData.location,
        updatedData.hourly_rate,
        updatedData.experience_years,
        updatedData.availability_status,
        userId
      ]
    );

    return res.json({
      message: "Profile updated successfully ✅",
      profile: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        u.role,
        u.is_identity_verified,
        p.id AS profile_id,
        p.user_id,
        p.headline,
        p.bio,
        p.location,
        p.profile_image_url,
        p.banner_image_url,
        p.hourly_rate,
        p.experience_years,
        p.availability_status,
        p.impact_points,
        p.social_contribution_level,
        p.national_builder_badge,
        p.trust_score,
        p.total_reviews,
        p.average_rating,
        p.tier_level,
        p.reputation_level,
        p.achievement_points,
        p.skills,
        p.badges,
        p.created_at,
        p.updated_at
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found ❌"
      });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        u.is_identity_verified,
        p.headline,
        p.bio,
        p.location,
        p.profile_image_url,
        p.banner_image_url,
        p.hourly_rate,
        p.experience_years,
        p.trust_score,
        p.average_rating,
        p.total_reviews,
        p.reputation_level,
        p.tier_level,
        p.achievement_points,
        p.badges
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found ❌" });
    }

    const skillsResult = await pool.query(
  `
  SELECT
    s.skill_name,
    s.category,
    us.skill_level,
    us.years_of_experience,
    us.is_certified
  FROM user_skills us
  JOIN skills s ON us.skill_id = s.id
  WHERE us.user_id = $1
  `,
  [userId]
);

// PORTFOLIO
const portfolioResult = await pool.query(
  `
  SELECT *
  FROM portfolio_projects
  WHERE user_id = $1
  ORDER BY is_featured DESC, sort_order ASC, created_at DESC
  `,
  [userId]
);

const workHistoryResult = await pool.query(
  `
  SELECT *
  FROM work_history
  WHERE user_id = $1
  ORDER BY 
  is_current DESC,
  end_date DESC NULLS LAST,
  start_date DESC
  `,
  [userId]
);

const certificationsResult = await pool.query(
  `
  SELECT
    id,
    certification_name,
    issuing_authority,
    credential_id,
    issue_date,
    expiry_date,
    verification_url,
    certificate_file_url
  FROM certifications
  WHERE user_id = $1
    AND verification_status = 'verified'
  ORDER BY issue_date DESC
  `,
  [userId]
);

const reviewsResult = await pool.query(
  `
  SELECT 
    id,
    rating,
    comment,
    communication_rating,
    quality_rating,
    deadline_rating,
    is_edited,
    edited_at,
    created_at,
    reviewer_id
  FROM reviews
  WHERE freelancer_id = $1
    AND is_public = true
  ORDER BY created_at DESC
  `,
  [userId]
);

const badgesResult = await pool.query(
  `
  SELECT b.badge_name, b.badge_description, ub.awarded_at
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  WHERE ub.user_id = $1
  `,
  [userId]
);

res.json({
  success: true,
  profile: {
    ...result.rows[0],
    skills: skillsResult.rows,
    badges: badgesResult.rows,
    portfolio: portfolioResult.rows,
    workHistory: workHistoryResult.rows,
    certifications: certificationsResult.rows,
    reviews: reviewsResult.rows
  }

});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const { userId: paramId } = req.params;

    if (Number(userId) !== Number(paramId)) {
      return res.status(403).json({
        message: "Not allowed ❌"
      });
    }

    // for now we store fake path (later S3/cloud)
    const imagePath = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE profiles SET profile_image_url = $1 WHERE user_id = $2",
      [imagePath, userId]
    );

    res.json({
      message: "Avatar uploaded ✅",
      url: imagePath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

const uploadBanner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: paramId } = req.params;

    if (Number(userId) !== Number(paramId)) {
      return res.status(403).json({
        message: "Not allowed ❌"
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE profiles SET banner_image_url = $1 WHERE user_id = $2",
      [imagePath, userId]
    );

    res.json({
      message: "Banner uploaded ✅",
      url: imagePath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = {
  updateProfile,
  getMyProfile,
  getPublicProfile,
  uploadAvatar,
  uploadBanner
};