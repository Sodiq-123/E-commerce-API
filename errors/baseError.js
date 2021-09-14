class BaseError extends Error {
	constructor(name, statusCode, isOperational, desccription) {
		super(desccription);

		Object.setPrototypeOf(this, new.target.prototype)
		this.name = name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = BaseError;