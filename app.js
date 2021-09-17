const createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    exphbs = require('express-handlebars'),
    apiError = require('./errors/apiError'),
    httpStatusCodes = require('./errors/httpStatusCode'),
    logger = require('morgan'),
    userRouter = require('./src/routes/userRoute'),
    cardRouter = require('./src/routes/cardRoute');

const app = express();

// view engine setup
module.exports = function (app) {
  app.use(logger('dev'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Specify the routes
  app.use('/api/v1', userRouter)
  app.use('/api/v1/card', cardRouter)

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    // render a json response
    const response = new apiError('resource not found', httpStatusCodes.NOT_FOUND, 'The endpoint does not exist').getErrorObject()
    res.status(404).json(response)
  });

  // catch 500 and forward to error handler
  app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    const response = new apiError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER, 'Internal Server Error').getErrorObject()
    res.status(500).json(response)
    });

    return app;
};