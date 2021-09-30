const crypto  = require('crypto')
require('dotenv').config()
/**
 * General purpose data encryption function.
 */
exports.encryptString = async (data) => {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!data) {
    return {
      error: 'Invalid data'
    }
  }
  if (!encryptionKey) {
    return {
      error: 'Invalid encryption key'
    }
  }

  const cipher = crypto.createCipher('aes256', encryptionKey)
  const encryptedData = cipher.update(`${data}`, 'utf8', 'hex') + cipher.final('hex')

  return {
    data: {
      encryptedData
    }
  }
}


/**
 * General purpose data decryption function.
 */
exports.decryptString = async (data) => {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!data) {
    return {
      error: 'Invalid data'
    }
  }

  if (!encryptionKey) {
    return {
      error: 'Invalid encryption key'
    }
  }

  let decryptedData = ''

  try {
    const decipher = crypto.createDecipher('aes256', encryptionKey)
    decryptedData = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')
  } catch (error) {
    return {
      error: error.message
    }
  }

  return {
    data: {
      decryptedData
    }
  }
}