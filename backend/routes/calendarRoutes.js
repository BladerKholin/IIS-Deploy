const express = require('express');
const verifyToken  = require('../middleware/authMiddleware');
const calendarController = require('../controllers/calendarController');
const multer = require('multer');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();

router.get('/', verifyToken, calendarController.getEvents);
router.post('/', verifyToken, upload.array('attachment[]'), calendarController.createEvent);
router.delete('/:id', verifyToken, calendarController.removeEvent);
module.exports = router;