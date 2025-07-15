const pool = require("../db");
// Get all sended
const getAllSended = async (req, res) => {
    try {
        const [sended] = await pool.query("SELECT * FROM sended ORDER BY created_at DESC");
        res.json(sended);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get sended by category
const getSendedByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [sended] = await pool.query("SELECT * FROM sended WHERE category_id = ? ORDER BY created_at DESC", [categoryId]);
        res.json(sended);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get sended by category and user
const getSendedByCategoryAndUser = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [sended] = await pool.query("SELECT * FROM sended WHERE user_id = ? AND category_id = ?", [req.id, categoryId]);
        res.json(sended);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get sended by id
const getSendedById = async (req, res) => {
    try {
        const { sendedId } = req.params;
        const [sended] = await pool.query("SELECT * FROM sended WHERE id = ?", [sendedId]);
        res.json(sended[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Create a new entry in the sended table
const createSended = async (req, res) => {
    try {
        const {
            nro,
            document_type,
            document_date,
            recipient,
            prepared_by,
            matter,
            deploy_date,
            observations,
            administrative,
            category_id,
        } = req.body;

        const [result] = await pool.query(
            "INSERT INTO sended (nro, document_type, document_date, recipient, prepared_by, matter, deploy_date, observations, administrative, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nro, document_type, document_date, recipient, prepared_by, matter, deploy_date, observations, administrative, category_id, req.id]
        );
        const sendedId = result.insertId;

        const files = req.files;
        if (files && files.length > 0) {
            await Promise.all(
                files.map(file => {
                    const { originalname, buffer } = file;
                    return pool.query(
                        "INSERT INTO attachments (filename, data, table_name, record_id) VALUES (?, ?, ?, ?)",
                        [originalname, buffer, "sended", sendedId]
                    );
                })
            );
        }

        res.status(201).json({ id: sendedId, message: "Entry created successfully" });
    } catch (err) {
        console.error("Error creating entry:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllSended,
    getSendedByCategory,
    getSendedByCategoryAndUser,
    getSendedById,
    createSended,
};