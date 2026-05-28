'use strict';

const { body } = require('express-validator');
const { isDatabaseUuid } = require('./uuidValidator');

// Note: Using isUUID() instead of isInt() because Module 3 database uses UUIDs for all primary keys.

const submitBid = [
  body('job_id')
    .notEmpty().withMessage('Job ID is required')
    .custom(isDatabaseUuid).withMessage('Job ID must be a valid UUID'),
  
  body('cover_letter')
    .isString().withMessage('Cover letter must be a string')
    .trim()
    .notEmpty().withMessage('Cover letter is required')
    .isLength({ max: 2000 }).withMessage('Cover letter must not exceed 2000 characters'),
  
  body('bid_amount') // Using bid_amount to match DB schema instead of proposed_rate
    .notEmpty().withMessage('Bid amount is required')
    .isFloat({ min: 0 }).withMessage('Bid amount must be a non-negative number'),
  
  body('duration_label') // Using duration_label instead of estimated_days to map to string
    .optional()
    .isString().withMessage('Duration label must be a string')
    .notEmpty().withMessage('Duration label cannot be empty')
];

module.exports = { submitBid };
