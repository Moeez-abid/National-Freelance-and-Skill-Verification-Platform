const pool = require("../config/db");

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { freelancerId } = req.params;

    const {
      rating,
      comment,
      communication_rating,
      quality_rating,
      deadline_rating
    } = req.body;

    // ----------------------------
    // 1. GET USER ROLE (FIX ADDED)
    // ----------------------------
    const userResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [reviewerId]
    );

    const role = userResult.rows[0]?.role;

    // ----------------------------
    // 2. ONLY CLIENTS CAN REVIEW
    // ----------------------------
    if (role !== "client") {
      return res.status(403).json({
        message: "Only clients can submit reviews ❌"
      });
    }

    // ----------------------------
    // 3. PREVENT SELF REVIEW
    // ----------------------------
    if (Number(reviewerId) === Number(freelancerId)) {
      return res.status(400).json({
        message: "You cannot review yourself ❌"
      });
    }

    // ----------------------------
    // 4. INSERT REVIEW
    // ----------------------------
    const result = await pool.query(
      `
      INSERT INTO reviews (
        freelancer_id,
        reviewer_id,
        rating,
        comment,
        communication_rating,
        quality_rating,
        deadline_rating
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        freelancerId,
        reviewerId,
        rating,
        comment,
        communication_rating,
        quality_rating,
        deadline_rating
      ]
    );

    // ----------------------------
    // 5. UPDATE PROFILE STATS
    // ----------------------------
    const statsResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating)::numeric(10,2) as avg_rating
      FROM reviews
      WHERE freelancer_id = $1
      `,
      [freelancerId]
    );

    const { total_reviews, avg_rating } = statsResult.rows[0];

    // Calculate trust_score (0-100) and tier_level based on rating + review volume
    const reviewCount = parseInt(total_reviews, 10) || 0;
    const avgRatingNum = parseFloat(avg_rating) || 0;
    const trust_score = Math.min(100, Math.round((avgRatingNum / 5.0 * 70) + Math.min(reviewCount * 3, 30)));
    const tier_level = trust_score >= 75 ? 'Elite' : trust_score >= 40 ? 'Pro' : 'Rising';

    await pool.query(
      `
      UPDATE profiles
      SET
        total_reviews = $1,
        average_rating = $2,
        trust_score = $3,
        tier_level = $4,
        updated_at = NOW()
      WHERE user_id = $5
      `,
      [total_reviews, avg_rating, trust_score, tier_level, freelancerId]
    );

    res.status(201).json({
      success: true,
      message: "Review added and profile stats updated ✅",
      review: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// GET REVIEWS
const getReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM reviews
      WHERE freelancer_id = $1
        AND is_public = true
      ORDER BY created_at DESC
      `,
      [freelancerId]
    );

    res.json({
      success: true,
      reviews: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// UPDATE REVIEW
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const {
      rating,
      comment,
      communication_rating,
      quality_rating,
      deadline_rating
    } = req.body;

    const result = await pool.query(
      `
      UPDATE reviews
      SET
        rating = $1,
        comment = $2,
        communication_rating = $3,
        quality_rating = $4,
        deadline_rating = $5,
        is_edited = true,
        edited_at = NOW()
      WHERE id = $6 AND reviewer_id = $7
      RETURNING *
      `,
      [
        rating,
        comment,
        communication_rating,
        quality_rating,
        deadline_rating,
        reviewId,
        userId
      ]
    );

    const updatedReview = result.rows[0];

    // Recalculate profile stats after edit
    if (updatedReview) {
      const statsResult = await pool.query(
        `SELECT COUNT(*) as total_reviews, AVG(rating)::numeric(10,2) as avg_rating
         FROM reviews WHERE freelancer_id = $1`,
        [updatedReview.freelancer_id]
      );
      const { total_reviews, avg_rating } = statsResult.rows[0];
      const reviewCount = parseInt(total_reviews, 10) || 0;
      const avgRatingNum = parseFloat(avg_rating) || 0;
      const trust_score = Math.min(100, Math.round((avgRatingNum / 5.0 * 70) + Math.min(reviewCount * 3, 30)));
      const tier_level = trust_score >= 75 ? 'Elite' : trust_score >= 40 ? 'Pro' : 'Rising';
      await pool.query(
        `UPDATE profiles SET total_reviews=$1, average_rating=$2, trust_score=$3, tier_level=$4, updated_at=NOW()
         WHERE user_id=$5`,
        [total_reviews, avg_rating, trust_score, tier_level, updatedReview.freelancer_id]
      );
    }

    res.json({
      success: true,
      message: "Review updated ✅",
      review: updatedReview
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // Get freelancer_id before deleting so we can recalculate stats
    const reviewRow = await pool.query(
      `SELECT freelancer_id FROM reviews WHERE id = $1 AND reviewer_id = $2`,
      [reviewId, userId]
    );
    if (!reviewRow.rows.length) {
      return res.status(404).json({ message: "Review not found ❌" });
    }
    const freelancerId = reviewRow.rows[0].freelancer_id;

    await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND reviewer_id = $2`,
      [reviewId, userId]
    );

    // Recalculate profile stats after deletion
    const statsResult = await pool.query(
      `SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating),0)::numeric(10,2) as avg_rating
       FROM reviews WHERE freelancer_id = $1`,
      [freelancerId]
    );
    const { total_reviews, avg_rating } = statsResult.rows[0];
    const reviewCount = parseInt(total_reviews, 10) || 0;
    const rating = parseFloat(avg_rating) || 0;
    const trust_score = Math.min(100, Math.round((rating / 5.0 * 70) + Math.min(reviewCount * 3, 30)));
    const tier_level = trust_score >= 75 ? 'Elite' : trust_score >= 40 ? 'Pro' : 'Rising';

    await pool.query(
      `UPDATE profiles SET total_reviews=$1, average_rating=$2, trust_score=$3, tier_level=$4, updated_at=NOW()
       WHERE user_id=$5`,
      [total_reviews, avg_rating, trust_score, tier_level, freelancerId]
    );

    res.json({ success: true, message: "Review deleted ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// GET RECENT REVIEWS FOR DASHBOARD
const getMyRecentReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    let query = '';
    if (role === 'freelancer') {
      query = `
        SELECT r.*, u.first_name, u.last_name 
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.freelancer_id = $1
        ORDER BY r.created_at DESC LIMIT 5
      `;
    } else {
      query = `
        SELECT r.*, u.first_name, u.last_name 
        FROM reviews r
        JOIN users u ON r.freelancer_id = u.id
        WHERE r.reviewer_id = $1
        ORDER BY r.created_at DESC LIMIT 5
      `;
    }

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      reviews: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getMyRecentReviews
};