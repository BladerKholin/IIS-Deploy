const pool = require("../db");

const getUserRole = async (req, res) => {
  console.log(req.role);
  res.json({ role: req.role });
};

const getUserDepartment = async (req, res) => {
  res.json({ department: req.department });
};

const getUserName = async (req, res) => {
  res.json({ name: req.user });
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    console.error(err.message);
  }
};

// update user email
const updateUserEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await pool.query("UPDATE users SET email = ? WHERE id = ?", [email, req.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error updating email" });
  }
};

// get email by user id
const getUserEmail = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT email FROM users WHERE id = ?", [req.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ email: rows[0].email });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching email" });
  }
};

module.exports = { getUserRole, getUserDepartment, getUserName, getAllUsers, updateUserEmail, getUserEmail };