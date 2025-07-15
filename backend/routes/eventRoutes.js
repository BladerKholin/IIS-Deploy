const express = require('express');
const  verifyToken  = require('../middleware/authMiddleware');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();
const {
    getEventsByCategory,
    getFilteredEvents,
    getEventById,
    getEventsByUser,
    createEvent,
    updateEventStatus
} = require('../controllers/eventController');

// Get events by category
router.get('/category/:categoryId', verifyToken, getEventsByCategory);

// Get filtered events
router.get('/category/:categoryId/filter', verifyToken, getFilteredEvents);

// Get an event by id
router.get('/:eventId', verifyToken, getEventById);

// Get events for a specific user
router.get('/category/:categoryId/user', verifyToken, getEventsByUser);

// Create a new event
router.post('/', verifyToken, upload.none(), createEvent);

// Update an event status
router.put('/:eventId', verifyToken, upload.none(),updateEventStatus);

module.exports = router;