const pool = require("../config/db");

// GET CERTIFICATIONS (PUBLIC)
const getCertifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM certifications
      WHERE user_id = $1
      ORDER BY issue_date DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      certifications: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const createCertification = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const {
      certification_name,
      issuing_authority,
      credential_id,
      issue_date,
      expiry_date,
      verification_url
    } = req.body;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `
      INSERT INTO certifications (
        user_id,
        certification_name,
        issuing_authority,
        credential_id,
        issue_date,
        expiry_date,
        verification_url,
        certificate_file_url,
        verification_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
      RETURNING *
      `,
      [
        userId,
        certification_name,
        issuing_authority,
        credential_id,
        issue_date,
        expiry_date,
        verification_url,
        fileUrl
      ]
    );

    res.status(201).json({
      success: true,
      message: "Certification submitted for verification ✅",
      certification: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const verifyCertification = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { certId } = req.params;

    const { status, rejection_reason } = req.body;
    
    console.log(`[VERIFY_CERT] Cert ${certId} by Admin ${adminId} -> ${status}`);

    // ❌ validation
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status ❌"
      });
    }

    const result = await pool.query(
      `
      UPDATE certifications
      SET 
        verification_status = $1,
        verified_by = $2,
        verified_at = NOW(),
        updated_at = NOW(),
        rejection_reason = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        status,
        adminId,
        status === "rejected" ? rejection_reason : null,
        certId
      ]
    );

    res.json({
      success: true,
      message: `Certification ${status} ✅`,
      certification: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const deleteCertification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { certId } = req.params;

    console.log(`[DELETE_CERT] Attempting to delete cert ${certId} for user ${userId}`);

    const result = await pool.query(
      "DELETE FROM certifications WHERE id = $1 AND user_id = $2 RETURNING *",
      [certId, userId]
    );

    if (result.rows.length === 0) {
      console.log(`[DELETE_CERT] Cert ${certId} not found for user ${userId}`);
      return res.status(404).json({ message: "Certification not found or unauthorized ❌" });
    }

    console.log(`[DELETE_CERT] Successfully deleted cert ${certId}`);
    res.json({ success: true, message: "Certification deleted ✅" });
  } catch (err) {
    console.error("[DELETE_CERT] Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const updateCertification = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { certId } = req.params;
    const { certification_name, issuing_authority, credential_id, issue_date, expiry_date, verification_url } = req.body;

    const result = await pool.query(
      `UPDATE certifications 
       SET certification_name = COALESCE($1, certification_name),
           issuing_authority = COALESCE($2, issuing_authority),
           credential_id = COALESCE($3, credential_id),
           issue_date = COALESCE($4, issue_date),
           expiry_date = COALESCE($5, expiry_date),
           verification_url = COALESCE($6, verification_url),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [certification_name, issuing_authority, credential_id, issue_date, expiry_date, verification_url, certId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certification not found ❌" });
    }

    res.json({ success: true, certification: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error ❌" });
  }
};

const getAllCertifications = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT c.*, u.first_name, u.last_name, u.email
      FROM certifications c
      JOIN users u ON c.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE c.verification_status = $1`;
      params.push(status);
    }
    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, certifications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

module.exports = {
  getCertifications,
  createCertification,
  verifyCertification,
  updateCertification,
  deleteCertification,
  getAllCertifications
};