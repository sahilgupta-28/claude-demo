// Global error handler — must be registered LAST in app.js (after all routes).
// Handles known operational errors (AppError subclasses) and unexpected crashes.

const { AppError } = require('../shared/app.error');

const errorMiddleware = (err, req, res, next) => {
  // Known, operational errors thrown by services/controllers
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code:    err.code,
      message: err.message,
    });
  }

  // Sequelize unique constraint violation (email/phone duplicate at DB level)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      code:    'CONFLICT',
      message: `${field} is already in use`,
    });
  }

  // Sequelize model-level validation failure
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      code:    'VALIDATION_ERROR',
      message: err.errors?.[0]?.message,
    });
  }

  // Unexpected / non-operational error — hide internal details in production
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    code:    'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
};

module.exports = { errorMiddleware };
