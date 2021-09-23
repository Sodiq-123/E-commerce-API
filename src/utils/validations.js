const joi = require('joi')
const apiError = require('../../errors/apiError')

exports.validateUser = (email, username, password) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    username: joi.string().max(20).min(3).required(),
    password: joi.string().min(6).max(20).required(),
  })
  
  const validate = schema.validate({ email, username, password })
  if (validate.error) {
    return {
      success: false,
      error: validate.error.details[0].message
    }
  }

  return {
      success: true
    }
}

exports.validateAmount = (amount) => {
  const schema = joi.object({
    amount: joi.number().min(1).required()
  })
  const validate = schema.validate({ amount })
  if (validate.error) {
    return {
      success: false,
      error: validate.error.details[0].message
    }
  }
  return {
    success: true
  }
}

exports.transferAmount = (senderId, recipientId, amount) => {
  const schema = joi.object({
    senderId: joi.number().required(),
    recipientId: joi.number().required(),
    amount: joi.number().min(1).required()
  })
  const validate = schema.validate({ senderId, recipientId, amount })
  if (validate.error) {
    return {
      sucesss: false,
      error: validate.error.details[0].message
    }
  }
  return {
    success: true
  }
}