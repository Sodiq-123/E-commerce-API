const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')
const { addBank, deleteBank, getAllBanks, getNameAndSlug } = require('../controllers/banks');

router.get('/all', verifyToken, getAllBanks)
router.post('/add', verifyToken, addBank)
router.post('/delete/:bankId', verifyToken, deleteBank)
router.get('/get', getNameAndSlug)

module.exports = router;