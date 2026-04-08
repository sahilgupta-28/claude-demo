# Pre-Commit Quick Reference Checklist

Run through this checklist before committing any module. Every unchecked item is a reason to pause.

---

## Architecture

- [ ] Controller contains no business logic — see [Layer Responsibilities](../architecture/layers.md#controller)
- [ ] Service contains no ORM/DB imports — see [Layer Responsibilities](../architecture/layers.md#service)
- [ ] Repository contains no business logic — see [Layer Responsibilities](../architecture/layers.md#repository)
- [ ] Model contains no application logic — see [Layer Responsibilities](../architecture/layers.md#model)

## SOLID / DRY

- [ ] Each class has a single reason to change — see [SRP](../principles/solid-dry.md#s--single-responsibility-principle-srp)
- [ ] Dependencies are injected, not constructed inside the class — see [DIP](../principles/solid-dry.md#d--dependency-inversion-principle-dip)
- [ ] No duplicated validation rules — see [DRY](../principles/solid-dry.md#dry--dont-repeat-yourself)
- [ ] Shared logic is in `src/shared/`, not copy-pasted across modules

## Database

- [ ] Primary key defined on every model
- [ ] `timestamps: true` and `paranoid: true` configured
- [ ] Foreign key associations declared in models
- [ ] Multi-step writes wrapped in a Sequelize transaction — see [MySQL](../database/mysql.md#transaction-usage)

## Error Handling

- [ ] Domain errors use `AppError` subclasses — see [Error Classes](../standards/error-handling.md#error-class-hierarchy)
- [ ] All async route handlers wrapped in `asyncHandler`
- [ ] Global error middleware is the last middleware in `app.js`

## Validation

- [ ] All incoming request bodies validated with a Joi schema
- [ ] `validateBody` middleware applied on every write route
- [ ] `PASSWORD_RULE` reused — not redefined — for password fields — see [Validation](../standards/validation.md)

## Testing

- [ ] Unit tests written for service, controller, and repository
- [ ] Tests cover happy path **and** all error branches
- [ ] No real DB connections in unit tests
- [ ] All external dependencies mocked with `jest.fn()`
- [ ] Mocks cleared in `beforeEach`
- [ ] `npm test` is **green** before this task is marked complete — see [Automation](../hooks/automation.md)
- [ ] Any bug fix includes a regression test — see [Regression Tests](../testing/strategy.md#regression-test-rule)

## Swagger / OpenAPI

- [ ] Every route has a `@swagger` annotation
- [ ] All request body fields typed with examples
- [ ] All possible HTTP status codes listed in `responses`
- [ ] Protected routes include `security: [{ bearerAuth: [] }]`
- [ ] Annotation updated in the same edit as any route or validator change — see [Sync Rules](../documentation/swagger.md#sync-rules)
- [ ] `/docs` renders correctly after changes

## Security (auth routes only)

- [ ] Passwords hashed with bcrypt — never stored plain
- [ ] Refresh tokens stored as bcrypt hash — raw token never persisted
- [ ] Reset tokens stored as SHA-256 hash — see [Auth Security](../auth/security.md)
- [ ] Sensitive fields excluded from default Sequelize scope

---

## Related Docs

| Topic | File |
|-------|------|
| Architecture | [overview.md](../architecture/overview.md) |
| Layer rules | [layers.md](../architecture/layers.md) |
| SOLID & DRY | [solid-dry.md](../principles/solid-dry.md) |
| Repository pattern | [repository.md](../patterns/repository.md) |
| Dependency injection | [dependency-injection.md](../patterns/dependency-injection.md) |
| MySQL / Sequelize | [mysql.md](../database/mysql.md) |
| Error handling | [error-handling.md](error-handling.md) |
| Validation | [validation.md](validation.md) |
| Auth & security | [security.md](../auth/security.md) |
| Testing | [strategy.md](../testing/strategy.md) |
| Swagger | [swagger.md](../documentation/swagger.md) |
| Automation hooks | [automation.md](../hooks/automation.md) |
| Example module | [user-module.md](../examples/user-module.md) |
