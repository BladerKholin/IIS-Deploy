const pool = require("../db");

// Get receptions by category
const getReceptionsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [receptions] = await pool.query("SELECT * FROM receptions WHERE category_id = ? ORDER BY created_at DESC", [categoryId]);
        res.json(receptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get all receptions
const getAllReceptions = async (req, res) => {
    try {
        const [receptions] = await pool.query("SELECT * FROM receptions ORDER BY created_at DESC");
        res.json(receptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get reception by user and category
const getReceptionsByUserAndCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [receptions] = await pool.query("SELECT * FROM receptions WHERE user_id = ? AND category_id = ?", [req.id, categoryId]);
        res.json(receptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get reception by id
const getReceptionById = async (req, res) => {
    try {
        const { receptionId } = req.params;
        const [receptions] = await pool.query("SELECT * FROM receptions WHERE id = ?", [receptionId]);
        res.json(receptions[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Create a new reception
const createReception = async (req, res) => {
    try {
        const {
            nro,
            administrative,
            document_type,
            document_number,
            document_date,
            deploy_date,
            sender,
            receiver,
            matter,
            observations,
            category_id,
        } = req.body;

        const [result] = await pool.query(
            "INSERT INTO receptions (nro, administrative, document_type, document_number, document_date, deploy_date, sender, receiver, matter, observations, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nro, administrative, document_type, document_number, document_date, deploy_date, sender, receiver, matter, observations, category_id, req.id]
        );
        const receptionId = result.insertId;

        const files = req.files;
        if (files && files.length > 0) {
            await Promise.all(
                files.map(file => {
                    const { originalname, buffer } = file;
                    return pool.query(
                        "INSERT INTO attachments (filename, data, table_name, record_id) VALUES (?, ?, ?, ?)",
                        [originalname, buffer, "receptions", receptionId]
                    );
                })
            );
        }

        res.status(201).json({ id: receptionId, message: "Reception created successfully" });
    } catch (err) {
        console.error("Error creating reception:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getReceptionsByCategory,
    getAllReceptions,
    getReceptionsByUserAndCategory,
    getReceptionById,
    createReception,
};