'use strict';

const { body } = require('express-validator');
const { isDatabaseUuid } = require('./uuidValidator');

// Note: Using isUUID() instead of isInt() because Module 3 database uses UUIDs for all primary keys.

const createCategory = [
  body('name')
    .isString().withMessage('Name must be a string')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('slug')
    .isString().withMessage('Slug must be a string')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .isLength({ max: 120 }).withMessage('Slug must not exceed 120 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('parent_id')
    .optional()
    .custom(isDatabaseUuid).withMessage('Parent ID must be a valid UUID'),
  
  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
    
  body('icon_url')
    .optional()
    .isString().withMessage('Icon URL must be a string')
];

const updateCategory = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('slug')
    .optional()
    .isString().withMessage('Slug must be a string')
    .trim()
    .notEmpty().withMessage('Slug cannot be empty')
    .isLength({ max: 120 }).withMessage('Slug must not exceed 120 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('parent_id')
    .optional()
    .custom(isDatabaseUuid).withMessage('Parent ID must be a valid UUID'),
  
  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
];

module.exports = { createCategory, updateCategory };
