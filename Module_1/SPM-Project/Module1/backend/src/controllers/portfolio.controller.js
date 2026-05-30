const pool = require("../config/db");

const getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM portfolio_projects
      WHERE user_id = $1
      ORDER BY is_featured DESC, sort_order ASC, created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      projects: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const createProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const {
      title,
      description,
      project_url,
      github_url,
      completion_date,
      technologies,
      is_featured,
      sort_order
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO portfolio_projects (
        user_id, title, description, project_url,
        github_url, completion_date, technologies,
        is_featured, sort_order
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        userId,
        title,
        description,
        project_url,
        github_url,
        completion_date,
        technologies || [],
        is_featured || false,
        sort_order || 0
      ]
    );

    res.json({ success: true, project: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { projectId } = req.params;

    const result = await pool.query(
      `
      UPDATE portfolio_projects
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        project_url = COALESCE($3, project_url),
        github_url = COALESCE($4, github_url),
        completion_date = COALESCE($5, completion_date),
        technologies = COALESCE($6, technologies),
        is_featured = COALESCE($7, is_featured),
        sort_order = COALESCE($8, sort_order),
        updated_at = NOW()
      WHERE id = $9 AND user_id = $10
      RETURNING *
      `,
      [
        req.body.title,
        req.body.description,
        req.body.project_url,
        req.body.github_url,
        req.body.completion_date,
        req.body.technologies,
        req.body.is_featured,
        req.body.sort_order,
        projectId,
        userId
      ]
    );

    res.json({ success: true, project: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { projectId } = req.params;

    await pool.query(
      `
      DELETE FROM portfolio_projects
      WHERE id = $1 AND user_id = $2
      `,
      [projectId, userId]
    );

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const uploadProjectImage = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { projectId } = req.params;

    const imagePath = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `
      UPDATE portfolio_projects
      SET featured_image = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [imagePath, projectId, userId]
    );

    res.json({
      success: true,
      image: imagePath,
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { is_featured } = req.body;

    const result = await pool.query(
      `
      UPDATE portfolio_projects
      SET is_featured = $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [is_featured, projectId, userId]
    );

    return res.json({
      success: true,
      message: "Featured status updated ✅",
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const reorderProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projects } = req.body; 
    // format: [{id: 1, sort_order: 1}, {id: 2, sort_order: 2}]

    for (let p of projects) {
      await pool.query(
        `
        UPDATE portfolio_projects
        SET sort_order = $1
        WHERE id = $2 AND user_id = $3
        `,
        [p.sort_order, p.id, userId]
      );
    }

    res.json({
      success: true,
      message: "Projects reordered successfully ✅"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

module.exports = {
  getMyPortfolio,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  toggleFeatured,
  reorderProjects
};