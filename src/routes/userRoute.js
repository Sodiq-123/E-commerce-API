const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth')

const { 
  createUser, 
  loginUser,
  // deposit,
  transfer, 
  withdraw,
  getAllUsers,
  profile,
  fundAccount,
  initiateTransfer
} = require('../controllers/users')

router.post('/auth/create', createUser);
router.get('/users', getAllUsers)
router.post('/auth/login', loginUser)
router.get('/profile', verifyToken, profile)
// router.post('/deposit', verifyToken, deposit);
router.post('/withdraw', verifyToken, withdraw);
router.post('/transfer', verifyToken, transfer);
// initialize funding
router.post('/transfer/initialize', verifyToken, initiateTransfer);
router.post('/transfer/fund', verifyToken, fundAccount);
// router.post('/reversal', reversal);

module.exports = router;