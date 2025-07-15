const pool = require("../db");

const getEvents = async (req, res) => {
    try {
        const [departmentId] = await pool.query("SELECT id FROM departments WHERE name = ?", [req.department]);
        const [events] = await pool.query(
        `SELECT * FROM calendarEvents
        WHERE department_id = ? `, 
        [departmentId[0].id]);
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const createEvent = async (req, res) => {
    try {
        const files = req.files;
        const [departmentId] = await pool.query("SELECT id FROM departments WHERE name = ?", [req.department]);
        console.log("Department ID:", departmentId[0].id);
        const { title, start_date, end_date, all_day } = req.body;
        const [newEvent] = await pool.query(
            `
                INSERT INTO calendarEvents (title, start_date, end_date, all_day, department_id) 
                VALUES (?, ?, ? ,?, ?)
            `, [title, start_date, end_date, all_day === 'true' ? true : false , departmentId[0].id]);
        
        //add attachments
        const actionId = newEvent.insertId;

        if (files && files.length > 0) {
            await Promise.all(
                files.map(file => {
                    const { originalname, buffer } = file;
                    return pool.query(
                        "INSERT INTO attachments (filename, data, table_name, record_id) VALUES (?, ?, ?, ?)",
                        [originalname, buffer, "calendar", actionId]
                    );
                })
            );
        }
            res.status(201).json({ message: "Event created successfully" });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//removeEvent
const removeEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM calendarEvents WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {
    getEvents,
    createEvent,
    removeEvent,
};