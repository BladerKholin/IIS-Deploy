const express = require('express');
const  verifyToken  = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
const upload = require("../utils/fileUtils").upload;


const router = express.Router();

// Get all categories
router.get('/', verifyToken, categoryController.getAllCategories);

// Get all active categories
router.get('/active', verifyToken, categoryController.getActiveCategories);

// Create a new category
router.post('/', verifyToken, upload.none(), categoryController.createCategory);

// Reorder categories
router.put('/', verifyToken, upload.none(), categoryController.reorderCategories);

// Disable category
router.delete('/:categoryId', verifyToken, categoryController.disableCategory);

// Activate category
router.put('/:categoryId', verifyToken, upload.none(), categoryController.activateCategory);

module.exports = router;