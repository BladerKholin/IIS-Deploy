const authenticateUser = require("../ldap");

const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  authenticateUser(username, password, res);
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

module.exports = { login, logout };