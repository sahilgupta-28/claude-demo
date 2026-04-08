# Error Handling & Response Standardization

All errors flow through a single pipeline: `throw AppError subclass` → `asyncHandler catches it` → `errorMiddleware formats and sends the response`. Never write raw `res.status(500)` calls in controllers or services.

---

## Error Class Hierarchy

```js
// src/shared/app.error.js
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400, 'BAD_REQUEST');
  }
}

module.exports = {
  AppError, NotFoundError, ValidationError,
  UnauthorizedError, ForbiddenError, ConflictError, BadRequestError,
};
```

**Rule:** Services throw domain errors (`NotFoundError`, `ConflictError`). They **never** reference HTTP status codes directly.

---

## Response Helper

All successful responses are built through this helper. Never call `res.json()` directly in controllers.

```js
// src/shared/response.helper.js
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const paginated = (res, rows, count, page, limit) => {
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
};

module.exports = { success, created, paginated };
```

### Standard Response Shapes

**Success:**
```json
{ "success": true, "message": "User created successfully", "data": { ... } }
```

**Error:**
```json
{ "success": false, "code": "NOT_FOUND", "message": "User not found" }
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 50, "page": 2, "limit": 10, "totalPages": 5 }
}
```

---

## Async Handler

Eliminates `try/catch` boilerplate in every controller method. Wraps an async function and forwards any rejection to Express's `next(err)`.

```js
// src/shared/async.handler.js
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
```

Usage in a controller:

```js
getById = asyncHandler(async (req, res) => {
  // If this throws, asyncHandler catches it and calls next(err)
  const user = await this.userService.getUserById(req.params.id);
  return success(res, user);
});
```

---

## Global Error Middleware

Registered **last** in `app.js`. Handles all errors that reach `next(err)`.

```js
// src/middleware/error.middleware.js
const { AppError } = require('../shared/app.error');

const errorMiddleware = (err, req, res, next) => {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Sequelize unique constraint violation
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    return res.status(409).json({ success: false, code: 'CONFLICT', message: `${field} is already in use` });
  }

  // Sequelize model validation
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: err.errors?.[0]?.message });
  }

  // Sequelize FK constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({ success: false, code: 'CONSTRAINT_ERROR', message: 'Related resource not found' });
  }

  // Unknown — hide internals in production
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
};

module.exports = { errorMiddleware };
```

---

## Error Code Reference

| Code                | HTTP | When to throw |
|---------------------|------|---------------|
| `NOT_FOUND`         | 404  | Resource not found by ID or lookup |
| `VALIDATION_ERROR`  | 422  | Request body fails Joi or ORM validation |
| `UNAUTHORIZED`      | 401  | Missing/invalid/expired token |
| `FORBIDDEN`         | 403  | Authenticated but lacks permission |
| `CONFLICT`          | 409  | Unique constraint violation (email, phone) |
| `BAD_REQUEST`       | 400  | Invalid input that isn't a schema error (e.g., expired reset token) |
| `INTERNAL_ERROR`    | 500  | Unexpected / non-operational error |

---

## Related Docs

- [Validation](validation.md)
- [Auth Middleware](../auth/security.md)
- [Testing Strategy](../testing/strategy.md)
