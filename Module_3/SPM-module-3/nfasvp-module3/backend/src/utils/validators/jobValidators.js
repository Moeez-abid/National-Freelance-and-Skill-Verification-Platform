'use strict';

const { body } = require('express-validator');
const { isDatabaseUuid } = require('./uuidValidator');

// Note: Using isUUID() instead of isInt() because Module 3 database uses UUIDs for all primary keys.

const createJob = [
  body('title')
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  
  body('description')
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description is required'),
  
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .custom(isDatabaseUuid).withMessage('Category ID must be a valid UUID'),

  body('project_type')
    .optional()
    .isIn(['fixed_price', 'fixed', 'hourly']).withMessage('Project type must be fixed_price or hourly'),
  
  body('budget_min')
    .notEmpty().withMessage('Budget min is required')
    .isFloat({ min: 0 }).withMessage('Budget min must be a non-negative number'),
  
  body('budget_max')
    .notEmpty().withMessage('Budget max is required')
    .isFloat({ min: 0 }).withMessage('Budget max must be a non-negative number')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.budget_min)) {
        throw new Error('Budget max must be greater than or equal to budget min');
      }
      return true;
    }),
  
  body('expires_at') // Using expires_at to match schema instead of deadline
    .notEmpty().withMessage('Deadline (expires_at) is required')
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
  
  body('required_skills')
    .optional()
    .isArray().withMessage('Required skills must be an array'),
    
  body('required_skills.*')
    .optional()
    .custom(isDatabaseUuid).withMessage('Each required skill must be a valid UUID tag_id')
];

const updateJob = [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),
  
  body('category_id')
    .optional()
    .custom(isDatabaseUuid).withMessage('Category ID must be a valid UUID'),

  body('project_type')
    .optional()
    .isIn(['fixed_price', 'fixed', 'hourly']).withMessage('Project type must be fixed_price or hourly'),
  
  body('budget_min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget min must be a non-negative number'),
  
  body('budget_max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget max must be a non-negative number')
    .custom((value, { req }) => {
      if (req.body.budget_min !== undefined && parseFloat(value) < parseFloat(req.body.budget_min)) {
        throw new Error('Budget max must be greater than or equal to budget min');
      }
      return true;
    }),
  
  body('expires_at')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
  
  body('required_skills')
    .optional()
    .isArray().withMessage('Required skills must be an array'),
    
  body('required_skills.*')
    .optional()
    .custom(isDatabaseUuid).withMessage('Each required skill must be a valid UUID tag_id')
];

module.exports = { createJob, updateJob };
