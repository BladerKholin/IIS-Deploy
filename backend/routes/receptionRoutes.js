const express = require('express');
const  verifyToken  = require('../middleware/authMiddleware');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();
const {
    getReceptionsByCategory,
    getAllReceptions,
    getReceptionsByUserAndCategory,
    getReceptionById,
    createReception
} = require('../controllers/receptionController');

// Get receptions by category
router.get('/category/:categoryId', verifyToken, getReceptionsByCategory);

// Get all receptions
router.get('/', verifyToken, getAllReceptions);

// Get reception by user and category
router.get('/category/:categoryId/user', verifyToken, getReceptionsByUserAndCategory);

// Get reception by id
router.get('/:receptionId', verifyToken, getReceptionById);

// Create a new reception
router.post('/', verifyToken, upload.array('attachments'), createReception);

module.exports = router;