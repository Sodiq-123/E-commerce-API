const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')
const { addCard, deleteCard } = require('../controllers/cards')

router.post('/add', verifyToken, addCard)
router.post('/charge', verifyToken, addCard)
router.post('/pin', verifyToken, addCard)
router.post('/delete/:cardId', verifyToken, deleteCard)

module.exports = router;