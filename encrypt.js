const crypto  = require('crypto')

/**
 * General purpose data encryption function.
 */
exports.encryptString = async (data, encryptionKey) => {
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

console.log(this.encryptString('temitope123', '12345'))


/**
 * General purpose data decryption function.
 */
exports.decryptString = async (data, encryptionKey) => {
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

// console.log(this.decryptString())