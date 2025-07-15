const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();
const {
    getDocumentsByCategoryId,
    getDocumentsByUserAndCategory
} = require('../controllers/documentController');

router.get('/category/:categoryId', verifyToken, getDocumentsByCategoryId);
router.get('/category/:categoryId/user', verifyToken, getDocumentsByUserAndCategory);

module.exports = router;