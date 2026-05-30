// Outbound to Module 6 (Communication & Notifications)
// Called after bid acceptance / rejection to notify the relevant freelancer.
// All functions are non-blocking — failures must never affect marketplace state.

const axios  = require('axios');
const config = require('../../config/env');

const BASE_URL = config.module6.baseUrl;
const API_KEY  = config.module6.apiKey;

const headers = {
  'Content-Type'     : 'application/json',
  'X-Source-Module'  : 'module3',
  'Authorization'    : `Bearer ${API_KEY}`,
};

/**
 * Notify a freelancer that their bid was accepted.
 * @param {string} freelancerId
 * @param {string} clientId
 * @param {Object} project - { id, title, total_amount }
 * @returns {Promise<Object|null>}
 */
async function notifyBidAccepted(freelancerId, clientId, project) {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/notifications/bid-accepted`,
      {
        recipient_id  : freelancerId,
        sender_id     : clientId,
        project_id    : project.id,
        job_title     : project.title,
        agreed_amount : project.total_amount,
      },
      { headers, timeout: 5000 }
    );
    console.log(`[M6] bid-accepted notification sent to freelancer ${freelancerId}`);
    return res.data;
  } catch (err) {
    console.warn(`[M6] bid-accepted notification failed (non-fatal): ${err.message}`);
    return null;
  }
}

/**
 * Notify a freelancer that their bid was rejected.
 * @param {string} freelancerId
 * @param {string} jobId
 * @returns {Promise<Object|null>}
 */
async function notifyBidRejected(freelancerId, jobId) {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/notifications/bid-rejected`,
      { recipient_id: freelancerId, job_id: jobId },
      { headers, timeout: 5000 }
    );
    console.log(`[M6] bid-rejected notification sent to freelancer ${freelancerId}`);
    return res.data;
  } catch (err) {
    console.warn(`[M6] bid-rejected notification failed (non-fatal): ${err.message}`);
    return null;
  }
}

/**
 * Validate that an inbound request originates from Module 4 (AI Matching).
 * Module 4 calls our own endpoints — no outbound call needed.
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function validateModule4Request(req) {
  return req.headers['x-source-module'] === 'module4';
}

module.exports = { notifyBidAccepted, notifyBidRejected, validateModule4Request };
