// Outbound to Module 7 (Payment & Escrow)
// Called after bid acceptance to initiate escrow for the new project.
// Non-blocking — failure must never affect marketplace state.

const axios  = require('axios');
const config = require('../../config/env');

const BASE_URL = config.module7.baseUrl;
const API_KEY  = config.module7.apiKey;

const headers = {
  'Content-Type'   : 'application/json',
  'X-Source-Module': 'module3',
  'Authorization'  : `Bearer ${API_KEY}`,
};

/**
 * Initiate escrow for a newly awarded project.
 * @param {Object} project - { id, client_id, freelancer_id, total_amount }
 * @returns {Promise<Object|null>}
 */
async function initiateEscrow(project) {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/escrow/initiate`,
      {
        project_id         : project.id,
        client_user_id     : project.client_id,
        freelancer_user_id : project.freelancer_id,
        total_amount       : project.total_amount,
        currency_code      : 'PKR',
      },
      { headers, timeout: 8000 }
    );
    console.log(`[M7] Escrow initiated for project ${project.id}`);
    return res.data;
  } catch (err) {
    console.warn(`[M7] Escrow initiation failed (non-fatal): ${err.message}`);
    return null;
  }
}

module.exports = { initiateEscrow };
