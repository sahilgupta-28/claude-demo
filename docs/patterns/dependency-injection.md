# Dependency Injection

Dependencies are **injected from the outside** — never instantiated inside a class. This makes every layer independently testable and replaceable.

---

## The Pattern

Wire the full dependency graph in the module's route file. No class constructs its own dependencies.

```
Model → Repository → Service → Controller
  ↑         ↑           ↑          ↑
  └─────────┴───────────┴──────────┘
              wired in routes.js
```

---

## Implementation

```js
// src/modules/user/user.routes.js
const { Router } = require('express');
const { User } = require('./user.model');                         // 1. Model
const { UserRepository } = require('./user.repository');          // 2. Repository
const { UserService } = require('./user.service');                // 3. Service
const { UserController } = require('./user.controller');          // 4. Controller
const { validateBody } = require('../../middleware/validate.middleware');
const { createUserSchema, updateUserSchema } = require('./user.validator');

const router = Router();

// ─── Wire the dependency graph ────────────────────────────────────────────────
const userRepository = new UserRepository(User);          // inject model
const userService    = new UserService(userRepository);   // inject repository
const userController = new UserController(userService);   // inject service

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/',    (req, res, next) => userController.getAll(req, res, next));
router.get('/:id', (req, res, next) => userController.getById(req, res, next));
router.post('/',   validateBody(createUserSchema), (req, res, next) => userController.create(req, res, next));
router.put('/:id', validateBody(updateUserSchema), (req, res, next) => userController.update(req, res, next));
router.delete('/:id', (req, res, next) => userController.delete(req, res, next));

module.exports = router;
```

---

## Why This Matters for Testing

Because dependencies are injected, tests can swap the real implementation for a mock without patching module imports:

```js
// In a test — pass a mock repository directly into the service
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const userService = new UserService(mockRepository); // real service, fake data layer
```

No `jest.mock('../user.repository')` required. The seam is the constructor.

---

## Rules

- A class **never** calls `new Dependency()` inside its own constructor or methods.
- A class **never** calls `require('../some.service')` to obtain a sibling service — it receives it as a constructor argument.
- If a service needs two repositories, both are injected: `new OrderService(orderRepository, productRepository)`.
- The route file is the **only** place where `new` is called for wiring; it is not business logic.

---

## Related Docs

- [SOLID Principles — DIP](../principles/solid-dry.md#d--dependency-inversion-principle-dip)
- [Repository Pattern](repository.md)
- [Architecture Overview](../architecture/overview.md)
