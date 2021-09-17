const BaseError = require('./baseError')

class apiError extends BaseError {
    constructor (
        name,
        statusCode,
        message,
        isOperational = true
    ) {
        super(isOperational)
        this.name = name
        this.statusCode = statusCode
        this.message = message
    }
    getErrorObject () {
        return {
            name: this.name,
            statusCode: this.statusCode,
            message: this.message,
            isOperational: this.isOperational
        }
    }
}

module.exports = apiError;