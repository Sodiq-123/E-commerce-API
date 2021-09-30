const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')
const { addCard, deleteCard, getCard, createCharge, submitPin } = require('../controllers/cards')

router.post('/add', verifyToken, addCard)
router.get('/get/:cardId', verifyToken, getCard)
router.post('/charge/:id', verifyToken, createCharge)
router.post('/pin', verifyToken, submitPin)
router.post('/delete/:cardId', verifyToken, deleteCard)

module.exports = router;