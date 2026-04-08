// Joi validation middleware. Applied on write routes before the controller.
// abortEarly: false — collects ALL errors so the client sees them in one response.
// stripUnknown: true — silently drops fields not declared in the schema (mass-assignment protection).

const { ValidationError } = require('../shared/app.error');

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false, // return all errors, not just the first
    stripUnknown: true,  // drop fields not in the schema
    convert:      true,  // coerce types (e.g. trim strings, lowercase email)
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new ValidationError(message));
  }

  req.body = value; // replace with sanitized, type-coerced value
  next();
};

module.exports = { validateBody };
