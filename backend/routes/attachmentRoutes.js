const express = require('express');
const pool = require('../db');

const libre = require('libreoffice-convert');
const verifyToken = require('../middleware/authMiddleware');

const {getAttachmentsByActionId, downloadAttachmentById, showcaseAttachmentById} = require('../controllers/attachmentController');

const router = express.Router();

// Download attachment by id
router.get('/download/:id', downloadAttachmentById);

// Showcase attachment by id
router.get('/showcase/:id', verifyToken, showcaseAttachmentById);


// Get all attachments for a specific action
router.get("/:actionId/:tableName", verifyToken, getAttachmentsByActionId);


module.exports = router;