const joi = require('joi')
const apiError = require('../../errors/apiError')

export const validateUser = (email, username, password) => {
  const res = joi.object({
    email: joi.string().required(),
    username: joi.string().required(),
    password: joi.string().required(),
  })
  
  const validate = res.validate({ email, username, password })
  if (validate.error) {
    return {
      success: false,
      error: validate.error.details[0].message
    }
  }
}

// export const 