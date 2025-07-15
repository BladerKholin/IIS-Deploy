const pool = require("../db");


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [department_id] = await pool.query('SELECT id FROM departments WHERE name = ?', [req.department]);
        const [categories] = await pool.query("SELECT * FROM categories WHERE department_id = ? ORDER BY position ASC", [department_id[0].id]);
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get all active categories
const getActiveCategories = async (req, res) => {
    try {
        const [department_id] = await pool.query('SELECT id FROM departments WHERE name = ?', [req.department]);
        const [categories] = await pool.query("SELECT * FROM categories WHERE active = true AND department_id = ? ORDER BY position ASC", [department_id[0].id]);
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    if (req.role !== 'Admin') {
        return res.status(403).send({ error: 'Unauthorized' });
    }
    try {
        const { name } = req.body;
        const [department_id] = await pool.query('SELECT id FROM departments WHERE name = ?', [req.department]);
        const [result] = await pool.query("INSERT INTO categories (name, created_by, department_id) VALUES (?, ?, ?)", [name, req.id, department_id[0].id]);
        res.json({ id: result.insertId, name });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Reorder categories
const reorderCategories = async (req, res) => {
    if (req.role !== 'Admin') {
        return res.status(403).send({ error: 'Unauthorized' });
    }
    try {
        const { categories } = req.body;
        const promises = categories.map((category, index) => pool.query("UPDATE categories SET position = ? WHERE id = ?", [index, category.id]));
        await Promise.all(promises);
        res.json({ message: "Categories reordered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Disable category
const disableCategory = async (req, res) => {
    if (req.role !== 'Admin') {
        return res.status(403).send({ error: 'Unauthorized' });
    }
    try {
        const { categoryId } = req.params;
        await pool.query("UPDATE categories SET active = false WHERE id = ?", [categoryId]);
        res.json({ message: "Category disabled successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

// Activate category
const activateCategory = async (req, res) => {
    if (req.role !== 'Admin') {
        return res.status(403).send({ error: 'Unauthorized' });
    }
    try {
        const { categoryId } = req.params;
        await pool.query("UPDATE categories SET active = true WHERE id = ?", [categoryId]);
        res.json({ message: "Category activated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllCategories,
    getActiveCategories,
    createCategory,
    reorderCategories,
    disableCategory,
    activateCategory
};