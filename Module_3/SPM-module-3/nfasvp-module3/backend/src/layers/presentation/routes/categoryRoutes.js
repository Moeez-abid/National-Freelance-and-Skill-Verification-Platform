'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../../middleware/authMiddleware');
const categoryService = require('../../application/CategoryService');
const categoryValidators = require('../../../utils/validators/categoryValidators');
const handleValidationErrors = require('../../../utils/validators/handleValidationErrors');
const { success } = require('../../../utils/responseFormatter');

// Global authMiddleware removed to allow public access to GET routes

// GET /api/v1/categories - Fetch all active categories (nested tree)
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return success(res, categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/categories/:id - Fetch single category
router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return success(res, category);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories - Create category (Admin only)
router.post('/', authMiddleware, requireRole('admin'), categoryValidators.createCategory, handleValidationErrors, async (req, res, next) => {
  try {
    const newCategory = await categoryService.createCategory(req.user.id, req.body);
    return success(res, newCategory, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/categories/:id - Update category (Admin only)
router.put('/:id', authMiddleware, requireRole('admin'), categoryValidators.updateCategory, handleValidationErrors, async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.user.id, req.body);
    return success(res, updatedCategory);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
