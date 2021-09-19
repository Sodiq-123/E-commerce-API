const joi = require('joi')
const apiError = require('../../errors/apiError')

export const validateUser = (email, username, password) => {
  const schema = joi.object({
    email: joi.string().required(),
    username: joi.string().required(),
    password: joi.string().required(),
  })
  
  const validate = schema.validate({ email, username, password })
  if (validate.error) {
    return {
      success: false,
      error: validate.error.details[0].message
    }
  }
}

export const validateAmount = (accountId, amount) => {
  const schema = joi.object({
    accountId: joi.number().required(),
    ammount: joi.number().min(1).required()
  })
  const validate = schema.validate({ accountId, amount })
  if (validate.error) {
    return {
      success: false,
      error: validate.error.details[0].message
    }
  }
}

export const transferAmount = (senderId, recipientId, amount) => {
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
}