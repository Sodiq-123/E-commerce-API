const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')

const { 
  createUser, 
  loginUser,
  transfer, 
  withdraw,
  getAllUsers,
  profile,
  initializeDeposit,
  verifyDeposit
} = require('../controllers/users')

router.post('/auth/create', createUser);
router.get('/users', getAllUsers)
router.post('/auth/login', loginUser)
router.get('/profile', verifyToken, profile)
router.post('/transfer', verifyToken, transfer);
router.post('/deposit/initialize', verifyToken, initializeDeposit);
router.post('/deposit/verify/:reference', verifyToken, verifyDeposit);
router.post('/withdraw', verifyToken, withdraw);

module.exports = router;
