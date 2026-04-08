# Testing Strategy

## Stack

| Tool       | Purpose                                          |
|------------|--------------------------------------------------|
| Jest       | Test runner, assertions, mocking                 |
| Supertest  | HTTP integration tests (routes layer)            |
| Jest mocks | `jest.fn()`, `jest.mock()` for unit isolation    |

---

## Test Structure — AAA Pattern

Every test follows **Arrange → Act → Assert**. No exceptions.

```js
it('returns a user when found', async () => {
  // Arrange — set up mocks and input
  const mockUser = { id: 1, email: 'jane@test.com' };
  repo.findById.mockResolvedValue(mockUser);

  // Act — call the unit under test
  const result = await userService.getUserById(1);

  // Assert — verify the outcome
  expect(repo.findById).toHaveBeenCalledWith(1);
  expect(result).toEqual(mockUser);
});
```

---

## Coverage Requirements

| Layer      | Minimum | Test Type                       |
|------------|---------|---------------------------------|
| Service    | 90%     | Unit — mock the repository      |
| Controller | 90%     | Unit — mock the service         |
| Repository | 80%     | Unit — mock the Sequelize model |
| Routes     | 70%     | Integration — Supertest         |

---

## Unit Test Rules

- **Never** import or instantiate a real database connection in unit tests.
- **Mock all external dependencies:** databases, email services, payment gateways, JWT.
- **Test both paths:** the happy path and every error branch.
- **Reset mocks** in `beforeEach` to prevent test pollution.
- Test files live in `__tests__/` inside each module folder.

---

## Mock Factories

Define mock factories as functions at the top of each test file. This keeps setup DRY and makes it easy to override specific methods per test.

```js
// Service test — mock the repository
const makeRepo = (overrides = {}) => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  ...overrides,
});

// Controller test — mock the service
const makeService = (overrides = {}) => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  ...overrides,
});

// Repository test — mock the Sequelize model
const makeModel = (overrides = {}) => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn().mockResolvedValue([1]),
  destroy: jest.fn(),
  scope: jest.fn().mockReturnThis(),
  sequelize: { transaction: jest.fn() },
  ...overrides,
});
```

---

## Controller Test Pattern

Controllers use `asyncHandler`, so tests must `await` the method call — this ensures `.catch(next)` fires before the assertion.

```js
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

it('returns 200 with user data', async () => {
  userService.getProfile.mockResolvedValue(mockUser);
  const res = makeRes();

  await controller.getProfile({ user: { id: 1 } }, res, jest.fn());

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

it('calls next with NotFoundError when user is missing', async () => {
  userService.getProfile.mockRejectedValue(new NotFoundError('User'));
  const next = jest.fn();

  await controller.getProfile({ user: { id: 99 } }, makeRes(), next);

  expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
});
```

---

## Regression Test Rule

**Every bug fix must include a regression test** that would have caught the bug before it was introduced.

```js
// Regression test template
it('regression: [plain-English description of the bug]', async () => {
  // Arrange — reproduce the exact condition that caused the bug
  // Act     — trigger the code path
  // Assert  — confirm the correct behavior is now enforced
});
```

Example:

```js
it('regression: login does not allow disabled accounts even with valid credentials', async () => {
  repo.findByEmailWithSensitive.mockResolvedValue({ ...mockUser, isActive: false });
  bcrypt.compare.mockResolvedValue(true);

  await expect(service.login('jane@test.com', 'Secret123!')).rejects.toThrow(UnauthorizedError);
});
```

---

## Automated Test Enforcement

See [Automation Hooks](../hooks/automation.md) for the full test cycle Claude follows after every code change.

**The single non-negotiable rule:** no code is considered complete while any test is red.

---

## Related Docs

- [Automation Hooks](../hooks/automation.md)
- [Error Handling](../standards/error-handling.md)
- [Example — User Module Tests](../examples/user-module.md#unit-tests)
