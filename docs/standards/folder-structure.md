# Folder Structure

## Source Tree

```
src/
├── config/
│   ├── database.js          # Sequelize connection and pool config
│   ├── env.js               # Environment variable validation and export
│   └── swagger.js           # OpenAPI spec definition and component schemas
│
├── modules/                 # One folder per feature domain
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js   # @swagger annotations + DI wiring
│   │   ├── auth.validator.js
│   │   └── __tests__/
│   │       ├── auth.service.test.js
│   │       ├── auth.controller.test.js
│   │       └── auth.repository.test.js
│   │
│   └── user/
│       ├── user.controller.js
│       ├── user.service.js
│       ├── user.repository.js
│       ├── user.model.js
│       ├── user.routes.js   # @swagger annotations + DI wiring
│       ├── user.validator.js
│       └── __tests__/
│           ├── user.service.test.js
│           ├── user.controller.test.js
│           └── user.repository.test.js
│
├── shared/                  # Cross-cutting utilities — no business logic
│   ├── base.repository.js   # Common CRUD base class
│   ├── response.helper.js   # Standardized API response builders
│   ├── app.error.js         # Custom error class hierarchy
│   └── async.handler.js     # Async route wrapper (eliminates try/catch)
│
├── middleware/
│   ├── auth.middleware.js   # JWT verification, role authorization
│   ├── error.middleware.js  # Global error handler (must be last in app.js)
│   └── validate.middleware.js  # Joi request body validation
│
├── app.js                   # Express app setup — routes, middleware, /docs
└── server.js                # DB connection + HTTP server entry point
```

---

## Documentation Tree

```
docs/
├── architecture/
│   ├── overview.md          # Request flow, layer table, hard rules
│   └── layers.md            # What each layer owns and must not do
├── principles/
│   └── solid-dry.md         # SOLID (all 5) + DRY with examples
├── patterns/
│   ├── repository.md        # BaseRepository + module repository pattern
│   └── dependency-injection.md  # Constructor injection + wiring pattern
├── database/
│   └── mysql.md             # Schema rules, Sequelize config, associations
├── standards/
│   ├── folder-structure.md  # This file
│   ├── naming.md            # Naming conventions for all artifacts
│   ├── error-handling.md    # AppError classes, response helper, middleware
│   ├── validation.md        # Joi schemas, validateBody middleware
│   └── checklist.md         # Pre-commit quick reference
├── auth/
│   └── security.md          # JWT strategy, token lifecycle, auth middleware
├── testing/
│   └── strategy.md          # Stack, AAA pattern, coverage, regression tests
├── documentation/
│   └── swagger.md           # Setup, annotation format, sync rules
├── hooks/
│   └── automation.md        # Automated test workflow, hook config
└── examples/
    └── user-module.md       # Full working example (all layers + tests)
```

---

## Rules

- **One module per feature domain.** A module owns its controller, service, repository, model, routes, validator, and tests.
- **All module files are co-located** within their module folder — no scattering.
- **Shared utilities** live in `src/shared/` — never inside a specific module.
- **Middleware** is always in `src/middleware/` — never in modules.
- **Test files** live in `__tests__/` inside their module folder.
- **Config files** live in `src/config/` — nothing reads `process.env` directly outside of `env.js`.

---

## Related Docs

- [Naming Conventions](naming.md)
- [Architecture Overview](../architecture/overview.md)
