const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')
const { addCard } = require('../controllers/card')

router.post('/add', verifyToken, addCard)
// router.post('/edit')

module.exports = router;