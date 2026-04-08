# Claude AI Best Practices Demo

A production-grade **Node.js / Express / MySQL** REST API built live during a team demo to showcase how Claude AI can be used effectively to generate, structure, and maintain real-world backend code.

---

## Purpose

This project was created as a **team demonstration** of Claude AI best practices — showing how to:

- Prompt Claude to produce clean, layered, production-ready architecture
- Use Claude to enforce SOLID and DRY principles consistently across a codebase
- Let Claude generate boilerplate (models, repositories, services, controllers, validators, tests) without sacrificing quality
- Maintain a living documentation system (`CLAUDE.md` + `docs/`) that keeps Claude aligned with project standards across every conversation
- Use Claude to write and update Swagger annotations, Joi validators, and Jest tests in the same edit cycle as feature code

---

## What Claude Built

| Layer | What was generated |
|---|---|
| Architecture | Strict Router → Controller → Service → Repository → Model flow |
| Auth module | Signup, login, logout, token refresh, forgot/reset password |
| User module | Profile read and update |
| Security | JWT access + refresh tokens, bcrypt password hashing (12 rounds), HTTP-only cookies |
| Validation | Joi schemas with a reusable `validateBody` middleware |
| Error handling | `AppError` hierarchy, centralised error middleware, standardised JSON responses |
| API docs | Auto-generated Swagger UI at `/docs` via `swagger-jsdoc` |
| Tests | Jest + Supertest unit and integration tests with AAA pattern |

---

## Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| ORM | Sequelize |
| Database | MySQL |
| Validation | Joi |
| Auth | JWT (access + refresh) |
| Password hashing | bcrypt (12 rounds) |
| API docs | swagger-jsdoc + swagger-ui-express |
| Testing | Jest + Supertest |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env   # fill in DB credentials and JWT secrets

# 3. Start the dev server
npm run dev            # nodemon — auto-restarts on change

# 4. Run tests
npm test

# 5. View API docs
open http://localhost:3000/docs
```

---


## Key Claude AI Practices Demonstrated

### 1. Persistent Context via `CLAUDE.md`
A `CLAUDE.md` file at the project root acts as a standing instruction set for Claude. It defines architecture rules, naming conventions, error handling patterns, and links to detailed docs — so every new conversation starts with full project context.

### 2. Layered Architecture Enforcement
Claude was prompted to respect a strict layer boundary: controllers never touch the database, services never build HTTP responses, repositories never contain business logic. Claude enforced this consistently across every module.

### 3. One Source of Truth
Claude generated a single `AppError` class, a single response helper, and a single validator per schema — avoiding duplication across the codebase.

### 4. Test-Driven Output
Every feature prompt included a requirement to produce corresponding Jest + Supertest tests, keeping coverage high from the start.

### 5. Inline Documentation
Swagger `@swagger` JSDoc annotations were generated alongside route handlers in the same prompt, keeping API docs always in sync.

---

## Project Structure

```
src/
├── config/          # DB connection, Swagger setup
├── middleware/       # Auth, error handler, validate body
├── modules/
│   ├── auth/        # Routes, controller, service, repository, validators
│   └── users/       # Routes, controller, service, repository, validators
├── models/          # Sequelize models
├── utils/           # AppError, response helper, token utils
└── server.js        # Entry point

docs/                # Architecture, patterns, standards — Claude's reference docs
```

---

## Documentation

Full standards and patterns used in this project live in the `docs/` folder and are referenced by `CLAUDE.md`:

- [Architecture Overview](docs/architecture/overview.md)
- [Layer Responsibilities](docs/architecture/layers.md)
- [SOLID & DRY Principles](docs/principles/solid-dry.md)
- [Repository Pattern](docs/patterns/repository.md)
- [Error Handling](docs/standards/error-handling.md)
- [Validation](docs/standards/validation.md)
- [Auth & Security](docs/auth/security.md)
- [Testing Strategy](docs/testing/strategy.md)
- [Swagger / OpenAPI](docs/documentation/swagger.md)
