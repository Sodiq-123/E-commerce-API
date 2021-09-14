const BaseError = require('./baseError')

class apiError extends BaseError {
    constructor (
        name,
        statusCodes,
        message,
        isOperational = true
    ) {
        super(isOperational)
        this.name = name
        this.statusCodes = statusCodes
        this.message = message
    }
    getErrorObject () {
        return {
            name: this.name,
            statusCodes: this.statusCodes,
            message: this.message,
            isOperational: this.isOperational
        }
    }
}

module.exports = apiError;