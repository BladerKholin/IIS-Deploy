const pool = require("../db");
// Get all actions for a specific event
const getActionsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const [actions] = await pool.query("SELECT * FROM actions WHERE event_id = ?", [eventId]);
        res.json(actions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error fetching actions' });
    }
};

// Create a new action
const createAction = async (req, res) => {
    try {
        console.log(req.body);
        const { title, description, registry_date, estimated_date, responsible, event_id } = req.body;
        const files = req.files;

        const [result] = await pool.query(
            "INSERT INTO actions (title, description, registry_date, estimated_date, responsible, event_id) VALUES (?, ?, ?, ?, ?, ?)",
            [title, description, registry_date, estimated_date, responsible, event_id]
        );
        const actionId = result.insertId;

        if (files && files.length > 0) {
            await Promise.all(
                files.map(file => {
                    const { originalname, buffer } = file;
                    return pool.query(
                        "INSERT INTO attachments (filename, data, table_name, record_id) VALUES (?, ?, ?, ?)",
                        [originalname, buffer, "actions", actionId]
                    );
                })
            );
        }

        res.status(201).json({ actionId, message: "Action created successfully" });
    } catch (error) {
        console.error("Error creating action:", error.message);
        res.status(500).json({ error: 'Error creating action' });
    }
};

module.exports = {
    getActionsByEvent,
    createAction,
};
