const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(403).send({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: "Token inválido" });
    }

    req.user = decoded.username;
    req.role = decoded.role;
    req.department = decoded.department;
    req.id = decoded.id;
    next();
  });
};

module.exports = verifyToken;