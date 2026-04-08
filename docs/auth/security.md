# Authentication & Security

## Overview

This API uses **JWT-based stateless authentication** with a rotating refresh token stored as an `httpOnly` cookie. Passwords are hashed with bcrypt before storage and are never returned in any response.

---

## Token Strategy

| Token        | Purpose                       | Lifetime | Storage              |
|--------------|-------------------------------|----------|----------------------|
| Access token | Authenticate API requests     | 15 min   | Client memory / header |
| Refresh token | Obtain new access token      | 7 days   | `httpOnly` cookie    |

- The **access token** is sent in the `Authorization: Bearer <token>` header.
- The **refresh token** is sent as an `httpOnly`, `sameSite: strict` cookie — never accessible from JavaScript.
- The server stores a **bcrypt hash** of the refresh token, not the raw token, so a DB leak cannot be used to forge sessions.
- On password reset, all refresh tokens are invalidated by clearing `refreshTokenHash`.

---

## Auth Middleware

### `authenticate` — Verify Access Token

```js
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const { UnauthorizedError } = require('../shared/app.error');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, jwtConfig.accessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
};
```

### `authorize` — Role-Based Access Control

```js
// Must be used AFTER authenticate
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError('You do not have permission to perform this action'));
  }
  next();
};
```

Usage in routes:

```js
// Any authenticated user
router.get('/me', authenticate, controller.getProfile);

// Admin only
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

// Admin or manager
router.put('/:id', authenticate, authorize('admin', 'manager'), controller.update);
```

---

## Password Security

- **Hashing:** bcrypt with `saltRounds = 12`. Never MD5, SHA-1, or unsalted hashes.
- **Comparison:** Always `bcrypt.compare(plaintext, hash)` — never compare hashes directly.
- **Storage:** Only `passwordHash` is stored. The plaintext password is never logged or returned.
- **Reset flow:** Uses a SHA-256 hash of a random 32-byte token. The raw token is sent via email only; the hash is stored. Expired tokens are cleared on use.

```js
// Generating a reset token
const rawToken  = crypto.randomBytes(32).toString('hex');   // sent via email
const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex'); // stored in DB
```

---

## Token Rotation

On every `/auth/refresh` call:

1. Verify the incoming refresh token with `jwt.verify`.
2. Look up the user and `bcrypt.compare` against the stored hash.
3. If valid: generate a **new** access + refresh pair, hash and store the new refresh token.
4. The old refresh token is no longer valid.

This limits the damage from a stolen refresh token to the window before the next rotation.

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (min 12 rounds) — never stored plain
- [ ] Refresh token stored as bcrypt hash in DB — raw token never persisted
- [ ] Reset token stored as SHA-256 hash — raw token delivered via email only
- [ ] Access tokens expire in 15 minutes
- [ ] `httpOnly` + `sameSite: strict` cookie for refresh token
- [ ] Password reset invalidates all active sessions (`refreshTokenHash = null`)
- [ ] Forgot-password always returns HTTP 200 (prevents email enumeration)
- [ ] `req.user` set only after successful `jwt.verify` — never trusted from the request body

---

## Related Docs

- [Error Handling](../standards/error-handling.md) — `UnauthorizedError`, `ForbiddenError`
- [Validation](../standards/validation.md) — password strength rules
- [Swagger Annotations](../documentation/swagger.md) — how to document protected routes
