# Repository Pattern

The repository pattern abstracts all data access behind a class interface. Services never write ORM queries — they call repository methods. This keeps business logic decoupled from the database technology.

---

## BaseRepository

All repositories extend `BaseRepository`, which provides common CRUD operations. This is the DRY anchor — shared query logic lives in one place.

```js
// src/shared/base.repository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const [affectedCount] = await this.model.update(data, { where: { id }, ...options });
    return affectedCount;
  }

  async updateWhere(where, data, options = {}) {
    const [affectedCount] = await this.model.update(data, { where, ...options });
    return affectedCount;
  }

  async delete(id, options = {}) {
    return this.model.destroy({ where: { id }, ...options });
  }

  async transaction(callback) {
    return this.model.sequelize.transaction(callback);
  }
}

module.exports = { BaseRepository };
```

---

## Module Repository

Each module extends `BaseRepository` and adds domain-specific query methods.

```js
// src/modules/user/user.repository.js
const { BaseRepository } = require('../../shared/base.repository');

class UserRepository extends BaseRepository {
  constructor(UserModel) {
    super(UserModel);
  }

  // Includes sensitive fields (passwordHash, refreshTokenHash) — use for auth only
  async findByEmailWithSensitive(email) {
    return this.model.scope('withSensitive').findOne({ where: { email } });
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  async findByResetToken(token) {
    return this.model.scope('withSensitive').findOne({
      where: { resetPasswordToken: token },
    });
  }

  async findAllPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return this.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
  }
}

module.exports = { UserRepository };
```

---

## Rules

| Rule | Reason |
|------|--------|
| All ORM queries live in the repository | Keeps services testable without a database |
| Never import a repository inside another repository | Cross-repository logic belongs in the service layer |
| Use Sequelize scopes to control field visibility | Prevents sensitive fields leaking into non-auth code paths |
| `BaseRepository` is never modified for module-specific logic | Extend it instead |
| Repository methods return raw data, never HTTP shapes | The controller/service transforms data for responses |

---

## Testing Repositories

Mock the Sequelize model — never touch a real database in unit tests.

```js
const makeModel = (overrides = {}) => ({
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
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

## Related Docs

- [Dependency Injection](dependency-injection.md)
- [Testing Strategy](../testing/strategy.md)
- [Example — User Module](../examples/user-module.md)
