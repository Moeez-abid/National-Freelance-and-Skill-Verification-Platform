const pool = require("../config/db");

// GET WORK HISTORY
const getWorkHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
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

    res.json({
      success: true,
      work_history: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// CREATE WORK HISTORY
const createWorkHistory = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user

    const {
      company_name,
      job_title,
      start_date,
      end_date,
      is_current,
      description,
      location
    } = req.body;

    // 🔴 VALIDATION: current job cannot have end_date
    if (is_current && end_date) {
      return res.status(400).json({
        message: "Current job should not have end date ❌"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO work_history (
        user_id,
        company_name,
        job_title,
        start_date,
        end_date,
        is_current,
        description,
        location
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        userId,
        company_name,
        job_title,
        start_date,
        is_current ? null : end_date,
        is_current || false,
        description,
        location
      ]
    );

    res.status(201).json({
      success: true,
      message: "Work history added ✅",
      entry: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// UPDATE WORK HISTORY
const updateWorkHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entryId } = req.params;

    const {
      company_name,
      job_title,
      start_date,
      end_date,
      is_current,
      description,
      location
    } = req.body;

    // 🔴 VALIDATION
    if (is_current && end_date) {
      return res.status(400).json({
        message: "Current job should not have end date ❌"
      });
    }

    const result = await pool.query(
      `
      UPDATE work_history
      SET
        company_name = COALESCE($1, company_name),
        job_title = COALESCE($2, job_title),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        is_current = COALESCE($5, is_current),
        description = COALESCE($6, description),
        location = COALESCE($7, location),
        updated_at = NOW()
      WHERE id = $8 AND user_id = $9
      RETURNING *
      `,
      [
        company_name,
        job_title,
        start_date,
        is_current ? null : end_date,
        is_current,
        description,
        location,
        entryId,
        userId
      ]
    );

    res.json({
      success: true,
      message: "Work history updated ✅",
      entry: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// DELETE WORK HISTORY
const deleteWorkHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entryId } = req.params;

    await pool.query(
      `
      DELETE FROM work_history
      WHERE id = $1 AND user_id = $2
      `,
      [entryId, userId]
    );

    res.json({
      success: true,
      message: "Work history deleted ✅"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = 
{ getWorkHistory,
  createWorkHistory,
  updateWorkHistory,
  deleteWorkHistory
};