const express = require('express');
const verifyToken  = require('../middleware/authMiddleware');

const { exportToPdf, exportEventsToXlsx } = require('../controllers/exportsController');
const router = express.Router();
// Download attachment by id
router.get('/pdf/:id', verifyToken, exportToPdf);
router.get('/xlsx', verifyToken, exportEventsToXlsx);

module.exports = router;