// Wraps async route handlers so any rejected promise is forwarded to
// Express's next(err) pipeline — eliminates try/catch boilerplate in controllers.

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
