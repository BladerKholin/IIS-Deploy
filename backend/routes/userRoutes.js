const express = require("express");
const { getUserRole, getUserDepartment, getUserName, getAllUsers, updateUserEmail, getUserEmail } = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../utils/fileUtils").upload;

const router = express.Router();

router.get("/role", verifyToken, getUserRole);
router.get("/department", verifyToken, getUserDepartment);
router.get("/name", verifyToken, getUserName);
router.get("/", getAllUsers);
router.put("/email", verifyToken, upload.none(), updateUserEmail);
router.get("/email", verifyToken, getUserEmail);


module.exports = router;