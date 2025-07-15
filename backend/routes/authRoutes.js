const express = require("express");
const { login, logout } = require("../controllers/authController");
const upload = require("../utils/fileUtils").upload;

const router = express.Router();

router.post("/login", upload.none(), login);
router.get("/logout", logout);

module.exports = router;