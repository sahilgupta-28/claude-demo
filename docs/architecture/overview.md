# Architecture Overview

## Request Flow

```
Request → Router → Controller → Service → Repository → Model (ORM) → MySQL
                       ↕              ↕
                  Middleware      DTOs / Validators
```

## Layer Responsibilities

| Layer       | Responsibility                                     |
|-------------|----------------------------------------------------|
| Router      | Maps HTTP routes to controller methods             |
| Controller  | Parses request, calls service, returns response    |
| Service     | Business logic, orchestration, transformations     |
| Repository  | Data access abstraction — all DB queries live here |
| Model       | ORM entity definition, schema, relationships       |
| Middleware  | Auth, logging, rate-limiting, error handling       |

## Hard Rules

- Controllers must **never** contain business logic.
- Services must **never** import HTTP objects (`req`, `res`).
- Repositories must **never** contain business logic — only data access.
- Models must **never** contain logic beyond ORM configuration.

## Related Docs

- [Layer Responsibilities (detail)](layers.md)
- [Dependency Injection](../patterns/dependency-injection.md)
- [Folder Structure](../standards/folder-structure.md)
