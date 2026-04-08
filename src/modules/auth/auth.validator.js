// Joi validation schemas for auth endpoints.
// PASSWORD_RULE is defined once and reused — change strength requirements here only.

const Joi = require('joi');

// Strong password rule: 8–72 chars, must contain uppercase, lowercase, digit, special char.
// 72 chars is bcrypt's effective input limit.
const PASSWORD_RULE = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.pattern.name': 'Password must contain at least one {#name}',
  });

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).trim().required(),
  email:    Joi.string().email().lowercase().trim().required(),
  phone:    Joi.string()
               .pattern(/^\+?[1-9]\d{6,14}$/)
               .message('Phone must be a valid number (e.g. +1234567890)')
               .required(),
  address:  Joi.string().max(500).trim().optional().allow(''),
  password: PASSWORD_RULE.required(),
});

module.exports = { registerSchema };
