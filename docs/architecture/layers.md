# Layer Responsibilities

Each layer has a single, clearly bounded responsibility. Violations of these boundaries are bugs in architecture, not just style.

---

## Controller

**Owns:** HTTP boundary — request parsing and response formatting.

- Extract and sanitize input from `req.body`, `req.params`, `req.query`.
- Call exactly one service method per action.
- Return a standardized response via `response.helper`.
- Delegate all errors to `next(err)` via `asyncHandler`.

**Must NOT:**
- Contain `if/else` business logic.
- Query the database directly.
- Import repository or model classes.

---

## Service

**Owns:** All business rules and orchestration.

- Implement domain rules (uniqueness checks, state guards, calculations).
- Orchestrate calls across one or more repositories.
- Throw domain-specific errors (`NotFoundError`, `ConflictError`, etc.) — never HTTP status codes.
- Coordinate transactions when multiple writes must be atomic.

**Must NOT:**
- Import `req`, `res`, or `next`.
- Execute ORM queries directly — always go through a repository.
- Return HTTP status codes or response shapes.

---

## Repository

**Owns:** All data access — every ORM query lives here.

- Implement `findBy*`, `create`, `update`, `delete` methods.
- Extend `BaseRepository` for common CRUD operations.
- Return model instances or plain objects — never HTTP data.
- Use Sequelize scopes to control which fields are returned.

**Must NOT:**
- Contain business rules or conditional logic beyond query filtering.
- Call other repositories (that belongs in the service layer).
- Import middleware or HTTP utilities.

---

## Model

**Owns:** ORM schema, data types, field constraints, and associations.

- Define columns, data types, defaults, and nullability.
- Configure Sequelize options (`tableName`, `paranoid`, `underscored`, `timestamps`).
- Declare `hasMany`, `belongsTo`, `belongsToMany` associations.
- Apply field-level validations (`isEmail`, `len`, `notEmpty`) only.

**Must NOT:**
- Contain application logic, service calls, or imports from other layers.
- Perform data transformations beyond ORM-level hooks (use sparingly).

---

## Middleware

**Owns:** Cross-cutting concerns applied to the request pipeline.

- **`auth.middleware.js`** — verify JWT, attach `req.user`, enforce role-based access.
- **`validate.middleware.js`** — validate request body against a Joi schema before the controller runs.
- **`error.middleware.js`** — catch all errors thrown via `next(err)`, format and send the response.

---

## Related Docs

- [Architecture Overview](overview.md)
- [Error Handling](../standards/error-handling.md)
- [Validation](../standards/validation.md)
- [Auth Middleware](../auth/security.md)
