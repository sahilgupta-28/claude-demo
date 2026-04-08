# CLAUDE.md — API Development Standards & Guidelines

Production-grade Node.js / Express / MySQL API development guide.
Every section is a separate, focused file. Start here and follow the links.

---

## Quick Navigation

| I want to… | Go to |
|------------|-------|
| Understand the overall system design | [Architecture Overview](docs/architecture/overview.md) |
| Know what each layer is allowed to do | [Layer Responsibilities](docs/architecture/layers.md) |
| Apply SOLID and DRY principles | [SOLID & DRY](docs/principles/solid-dry.md) |
| Implement the Repository pattern | [Repository Pattern](docs/patterns/repository.md) |
| Wire dependencies without tight coupling | [Dependency Injection](docs/patterns/dependency-injection.md) |
| Design a MySQL schema with Sequelize | [MySQL / Database](docs/database/mysql.md) |
| Follow folder and file conventions | [Folder Structure](docs/standards/folder-structure.md) |
| Name files, classes, and routes correctly | [Naming Conventions](docs/standards/naming.md) |
| Handle errors and standardize responses | [Error Handling](docs/standards/error-handling.md) |
| Validate request input with Joi | [Validation](docs/standards/validation.md) |
| Implement JWT auth and secure passwords | [Auth & Security](docs/auth/security.md) |
| Write and organize unit tests | [Testing Strategy](docs/testing/strategy.md) |
| Set up Swagger and annotate endpoints | [Swagger / OpenAPI](docs/documentation/swagger.md) |
| Automate testing after every code change | [Automation Hooks](docs/hooks/automation.md) |
| See a complete working module | [Example — User Module](docs/examples/user-module.md) |
| Run a pre-commit check | [Checklist](docs/standards/checklist.md) |

---

## Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md              # Request flow, layer table, hard rules
│   └── layers.md                # What each layer owns and must never do
│
├── principles/
│   └── solid-dry.md             # All 5 SOLID principles + DRY, with code examples
│
├── patterns/
│   ├── repository.md            # BaseRepository + module repository pattern
│   └── dependency-injection.md  # Constructor injection + wiring in route files
│
├── database/
│   └── mysql.md                 # Schema rules, Sequelize config, soft deletes, transactions
│
├── standards/
│   ├── folder-structure.md      # src/ and docs/ tree with explanations
│   ├── naming.md                # Files, classes, routes, DB columns
│   ├── error-handling.md        # AppError hierarchy, response helper, error middleware
│   ├── validation.md            # Joi schemas, validateBody middleware, password rules
│   └── checklist.md             # Pre-commit quick reference with links
│
├── auth/
│   └── security.md              # JWT strategy, token rotation, bcrypt, auth middleware
│
├── testing/
│   └── strategy.md              # Stack, AAA pattern, coverage targets, regression tests
│
├── documentation/
│   └── swagger.md               # Setup, annotation format for all endpoint types, sync rules
│
├── hooks/
│   └── automation.md            # Test cycle, hook triggers, settings.json, failure diagnosis
│
└── examples/
    └── user-module.md           # Complete: model → repo → service → controller → tests
```

---

## Core Principles (Summary)

### Architecture
Every request flows through exactly these layers — no shortcuts:
```
Router → Controller → Service → Repository → Model → MySQL
```
Controllers own HTTP. Services own business logic. Repositories own queries. Models own schema.

### Code Quality
- **SOLID:** Every class has one reason to change. Depend on abstractions. Inject everything.
- **DRY:** One source of truth per concept — one error hierarchy, one response helper, one validator per schema.
- **OOP:** Inheritance only through `BaseRepository`. Composition for everything else.

### Automation
- Run `npm test` after every code change. Fix failures before moving on.
- Update `@swagger` annotations in the same edit as any route or validator change.
- Every bug fix ships with a regression test.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
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
cp .env.example .env    # fill in DB credentials and JWT secrets

# 3. Start the server
npm run dev             # nodemon — auto-restart on change

# 4. Run tests
npm test

# 5. View API docs
open http://localhost:3000/docs
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/signup` | Public | Register with name, email, phone, password |
| `POST` | `/api/auth/login` | Public | Returns accessToken + sets refresh cookie |
| `POST` | `/api/auth/logout` | Bearer | Invalidates session |
| `POST` | `/api/auth/refresh` | Cookie | Rotates access + refresh tokens |
| `POST` | `/api/auth/forgot-password` | Public | Issues hashed reset token |
| `POST` | `/api/auth/reset-password` | Public | Validates token, resets password, kills sessions |
| `GET` | `/api/users/me` | Bearer | Get own profile |
| `PATCH` | `/api/users/me` | Bearer | Update name / email / phone / address |
