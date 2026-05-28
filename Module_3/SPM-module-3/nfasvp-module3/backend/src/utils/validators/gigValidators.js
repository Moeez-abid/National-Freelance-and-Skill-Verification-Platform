'use strict';

const { body } = require('express-validator');
const { isDatabaseUuid } = require('./uuidValidator');

// Note: Using isUUID() instead of isInt() because Module 3 database uses UUIDs for all primary keys.

const createGig = [
  body('title')
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title must not exceed 120 characters'),
  
  body('description')
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description is required'),
  
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .custom(isDatabaseUuid).withMessage('Category ID must be a valid UUID'),
    
  body('thumbnail_url')
    .optional()
    .isString().withMessage('Thumbnail URL must be a string'),

  body('status')
    .optional()
    .isIn(['draft', 'live', 'paused']).withMessage('Status must be draft, live, or paused'),
  
  body('pricing_tiers')
    .optional()
    .isArray({ max: 3 }).withMessage('Pricing tiers must be an array with max 3 items'),
  
  body('pricing_tiers.*.tier')
    .optional()
    .isIn(['basic', 'standard', 'premium']).withMessage('Tier name must be basic, standard, or premium'),
    
  body('pricing_tiers.*.price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    
  body('pricing_tiers.*.delivery_days')
    .optional()
    .isInt({ min: 1 }).withMessage('Delivery days must be a positive integer'),
    
  body('pricing_tiers.*.deliverables')
    .optional()
    .isArray({ min: 1 }).withMessage('Deliverables must be a non-empty array'),

  body('required_tags')
    .optional()
    .isArray().withMessage('Required tags must be an array of tag UUIDs'),

  body('required_tags.*')
    .optional()
    .custom(isDatabaseUuid).withMessage('Each required tag must be a valid UUID')
];

const updateGig = [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 120 }).withMessage('Title must not exceed 120 characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),
  
  body('category_id')
    .optional()
    .custom(isDatabaseUuid).withMessage('Category ID must be a valid UUID'),
    
  body('thumbnail_url')
    .optional()
    .isString().withMessage('Thumbnail URL must be a string')
];

module.exports = { createGig, updateGig };
