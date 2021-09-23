const jwt = require('jsonwebtoken')
require('dotenv').config()
const { getUserById } = require('../utils/helpers')

exports.verifyToken = async (req, res, next) => {
  const authHeaders = req.headers.authorization
  try {
    const token = authHeaders.split(' ')[1]
    const userId = jwt.verify(token, process.env.SECRET_KEY)
    const user = await getUserById(userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Token'
      })
    }
    delete user.password
    req.user = user
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}