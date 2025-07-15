const express = require('express');
const { getActionsByEvent, createAction } = require('../controllers/actionController');
const verifyToken = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();


// Get all actions for a specific event
router.get('/:eventId', verifyToken, getActionsByEvent);

// Create a new action
router.post('/', verifyToken, upload.array('attachment[]'), createAction);

module.exports = router;