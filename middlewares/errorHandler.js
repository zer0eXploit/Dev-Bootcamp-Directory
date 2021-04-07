const ErrorResponse = require('../utils/errorResponse');

// @desc    Catches an error an handles it
const errorHandler = (err, req, res, next) => {
  const defaultErrorMsg = 'Something went wrong on our servers.';
  let error = { ...err };

  //Error message is not attained by destructuring
  //Thus, we need to attach it manually
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);

  //   Invalid ObjectID error
  if (err.name === 'CastError') {
    const message = `Resource not found with ID ${err.value}.`;
    error = new ErrorResponse(message, 404);
  }

  //   Duplicate Field Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered.`;
    error = new ErrorResponse(message, 400);
  }

  //   Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.keys(err.errors)
      .map((name) => error.errors[name].message)
      .join(' ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || defaultErrorMsg,
  });
};

module.exports = errorHandler;
