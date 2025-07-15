const express = require('express');
const verifyToken  = require('../middleware/authMiddleware');
const upload = require("../utils/fileUtils").upload;

const router = express.Router();
const {
    getAllSended,
    getSendedByCategory,
    getSendedByCategoryAndUser,
    getSendedById,
    createSended
} = require('../controllers/sendedController');

router.get('/', verifyToken, getAllSended);
router.get('/category/:categoryId', verifyToken, getSendedByCategory);
router.get('/category/:categoryId/user', verifyToken, getSendedByCategoryAndUser);
router.get('/:sendedId', verifyToken, getSendedById);
router.post('/', verifyToken, upload.array('attachments'), createSended);

module.exports = router;