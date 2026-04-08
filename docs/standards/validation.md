# Validation

All incoming request data is validated at the HTTP boundary using **Joi** before it reaches the controller. Business-level checks (uniqueness, state) happen in the service layer.

---

## Validation Middleware

```js
// src/middleware/validate.middleware.js
const { ValidationError } = require('../shared/app.error');

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // collect all errors, not just the first
    stripUnknown: true,  // remove fields not in the schema
    convert: true,       // coerce types (e.g. string → lowercase)
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new ValidationError(message));
  }

  req.body = value; // sanitized and type-coerced value
  next();
};

module.exports = { validateBody };
```

Applied on write routes only:

```js
router.post('/', validateBody(createUserSchema), (req, res, next) => userController.create(req, res, next));
router.patch('/:id', validateBody(updateUserSchema), (req, res, next) => userController.update(req, res, next));
```

---

## Schema Patterns

### Strong Password Rule (reusable)

Define once, import everywhere a password field is needed.

```js
const PASSWORD_RULE = Joi.string()
  .min(8)
  .max(72)                              // bcrypt hard limit
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.pattern.name': 'Password must contain at least one {#name}',
  });
```

### Signup Schema

```js
// src/modules/auth/auth.validator.js
const signupSchema = Joi.object({
  name:     Joi.string().min(2).max(100).trim().required(),
  email:    Joi.string().email().lowercase().trim().required(),
  phone:    Joi.string()
              .pattern(/^\+?[1-9]\d{6,14}$/)
              .message('Phone must be a valid international number (e.g. +1234567890)')
              .required(),
  address:  Joi.string().max(500).trim().optional().allow(''),
  password: PASSWORD_RULE.required(),
});
```

### Partial Update Schema

Use `.min(1)` to require at least one field on update requests.

```js
const updateProfileSchema = Joi.object({
  name:    Joi.string().min(2).max(100).trim(),
  email:   Joi.string().email().lowercase().trim(),
  phone:   Joi.string().pattern(/^\+?[1-9]\d{6,14}$/),
  address: Joi.string().max(500).trim().allow(''),
}).min(1);
```

### Reset Password Schema

```js
const resetPasswordSchema = Joi.object({
  token:    Joi.string().hex().length(64).required(),
  password: PASSWORD_RULE.required(),
});
```

---

## Rules

| Rule | Reason |
|------|--------|
| One Joi schema per operation (signup, login, update…) | Avoids a monolithic validator that tries to handle all cases |
| `abortEarly: false` always | Users see all errors at once, not one at a time |
| `stripUnknown: true` always | Prevents mass-assignment of unexpected fields |
| `convert: true` + `.lowercase()` on emails | Normalizes input before it reaches the service |
| Never duplicate schema rules in the service | If the validator allows it, the service trusts it |
| Password reuse: define `PASSWORD_RULE` once | Change strength requirements in one place |

---

## Related Docs

- [Error Handling](error-handling.md)
- [Auth Security](../auth/security.md)
- [Swagger Documentation](../documentation/swagger.md) — validators must be mirrored in annotations
