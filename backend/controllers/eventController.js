const pool = require("../db");

// Get events by category
const getEventsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [events] = await pool.query("SELECT * FROM events WHERE category_id = ? ORDER BY created_at DESC", [categoryId]);
        res.json(events);
    } catch (err) {
        console.error(err.message);
    }
};

// Get filtered events
const getFilteredEvents = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { status, startDate, endDate, user } = req.query;
        let query = "SELECT * FROM events WHERE category_id = ? ";
        const params = [categoryId];
        if (status) {
            query += "AND status = ? ";
            params.push(status);
        }
        if (startDate) {
            query += "AND start_date >= ? ";
            params.push(startDate);
        }
        if (endDate) {
            query += "AND end_date <= ? ";
            params.push(endDate);
        }
        if (user) {
            query += "AND user_id = ? ";
            user ? params.push(user) : params.push(req.id);
        }
        query += "ORDER BY created_at DESC";
        const [events] = await pool.query(query, params);
        res.json(events);
    } catch (err) {
        console.error(err.message);
    }
};

// Get an event by id
const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const [events] = await pool.query("SELECT * FROM events WHERE id = ?", [eventId]);
        res.json(events[0]);
    } catch (err) {
        console.error(err.message);
    }
};

// Get events for a specific user
const getEventsByUser = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [events] = await pool.query("SELECT * FROM events WHERE user_id = ? AND category_id = ?", [req.id, categoryId]);
        res.json(events);
    } catch (err) {
        console.error(err.message);
    }
};

// Create a new event
const createEvent = async (req, res) => {
    console.log(req.body);
    try {
        const { title, responsible, start_date, end_date, status, category_id } = req.body;
        const [result] = await pool.query(
            "INSERT INTO events (title, user_id, responsible, start_date, end_date, status, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, req.id, responsible, start_date, end_date, status, category_id]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err.message);
    }
};

// Update an event status
const updateEventStatus = async (req, res) => {
    try {
        console.log(req.body);
        const { eventId } = req.params;
        const { status } = req.body;
        
        await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, eventId]);
        res.json({ message: "Event updated successfully" });
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = {
    getEventsByCategory,
    getFilteredEvents,
    getEventById,
    getEventsByUser,
    createEvent,
    updateEventStatus
};