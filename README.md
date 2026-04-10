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

---

## Documentation branches (`docs-*`)

This repository includes **additional guideline packs** under `docs-*` folders (NestJS, Next.js, React, Node.js, FastAPI). You can keep **`main`** as the integration branch for the demo API and publish **each `docs-*` tree on its own Git branch** so teams can clone or track only the stack they need.

**Replace `YOUR_ORG` and `YOUR_REPO`** in the links below with your GitHub organization and repository name.

### Back to `main`

| | |
|--|--|
| **`main` branch (tree)** | [https://github.com/YOUR_ORG/YOUR_REPO/tree/main](https://github.com/YOUR_ORG/YOUR_REPO/tree/main) |
| **Root README on `main`** | [https://github.com/YOUR_ORG/YOUR_REPO/blob/main/README.md](https://github.com/YOUR_ORG/YOUR_REPO/blob/main/README.md) |

### Branch links (suggested names)

Each row points at the **branch root** on GitHub. Each folder has its own **README** with stack details, coverage table, and a **← Back to `main`** link.

| Branch | Stack | What it is |
|--------|--------|------------|
| [`docs-nestjs`](https://github.com/YOUR_ORG/YOUR_REPO/tree/docs-nestjs) | NestJS + PostgreSQL + Prisma | API guidelines: DTOs/class-validator, guards, Prisma repos, `@nestjs/swagger`, Jest. [Folder README](docs-nestjs/README.md) |
| [`docs-nextjs`](https://github.com/YOUR_ORG/YOUR_REPO/tree/docs-nextjs) | Next.js App Router + Prisma + Zod | Full-stack: RSC, Route Handlers, Server Actions, security headers, Playwright. [Folder README](docs-nextjs/README.md) |
| [`docs-reactjs`](https://github.com/YOUR_ORG/YOUR_REPO/tree/docs-reactjs) | React (client) + Zod | SPA patterns: API client layer, MSW/RTL, browser security; no Prisma in the bundle. [Folder README](docs-reactjs/README.md) |
| [`docs-nodejs`](https://github.com/YOUR_ORG/YOUR_REPO/tree/docs-nodejs) | Node.js (Express/Fastify) + Prisma + Zod | Classic layered HTTP API with Zod middleware and Supertest. [Folder README](docs-nodejs/README.md) |
| [`docs-fastapi`](https://github.com/YOUR_ORG/YOUR_REPO/tree/docs-fastapi) | FastAPI + SQLAlchemy + Pydantic | Async Python: Alembic, `Depends()`, pytest + httpx. [Folder README](docs-fastapi/README.md) |

### Publishing a `docs-*` folder on its own branch (example)

From a clean worktree, you can make the contents of e.g. `docs-nestjs/` the root of branch `docs-nestjs`:

```bash
git subtree split -P docs-nestjs -b docs-nestjs
git push origin docs-nestjs
```

Alternatively use a **sparse checkout** or **separate remotes** per team—pick the workflow that fits your org. The **README** inside each `docs-*` folder is written to match the “single folder = branch root” layout once published.
