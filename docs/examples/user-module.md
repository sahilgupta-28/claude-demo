# Example Module — User

A complete, working reference implementation across all layers. Use this as the template when building a new module.

---

## Model

```js
// src/modules/user/user.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define(
  'User',
  {
    id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name:      { type: DataTypes.STRING(100), allowNull: false },
    email:     { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    phone:     { type: DataTypes.STRING(20),  allowNull: false, unique: true },
    address:   { type: DataTypes.TEXT, allowNull: true },
    passwordHash:        { type: DataTypes.STRING(255), allowNull: false },
    role:                { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
    isActive:            { type: DataTypes.BOOLEAN, defaultValue: true },
    resetPasswordToken:  { type: DataTypes.STRING(255), allowNull: true },
    resetPasswordExpires:{ type: DataTypes.DATE, allowNull: true },
    refreshTokenHash:    { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: 'users',
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'resetPasswordExpires', 'refreshTokenHash'] },
    },
    scopes: {
      withSensitive: { attributes: {} },
    },
  }
);

module.exports = { User };
```

---

## Base Repository

```js
// src/shared/base.repository.js
class BaseRepository {
  constructor(model) { this.model = model; }

  async findAll(options = {})          { return this.model.findAll(options); }
  async findAndCountAll(options = {})  { return this.model.findAndCountAll(options); }
  async findById(id, options = {})     { return this.model.findByPk(id, options); }
  async findOne(where, options = {})   { return this.model.findOne({ where, ...options }); }
  async create(data, options = {})     { return this.model.create(data, options); }

  async update(id, data, options = {}) {
    const [n] = await this.model.update(data, { where: { id }, ...options });
    return n;
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

## Repository

```js
// src/modules/user/user.repository.js
const { BaseRepository } = require('../../shared/base.repository');

class UserRepository extends BaseRepository {
  constructor(UserModel) { super(UserModel); }

  async findByEmailWithSensitive(email) {
    return this.model.scope('withSensitive').findOne({ where: { email } });
  }

  async findByEmail(email)  { return this.findOne({ email }); }
  async findByPhone(phone)  { return this.findOne({ phone }); }

  async findByResetToken(token) {
    return this.model.scope('withSensitive').findOne({ where: { resetPasswordToken: token } });
  }

  async findByIdWithSensitive(id) {
    return this.model.scope('withSensitive').findByPk(id);
  }

  async findAllPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return this.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
  }
}

module.exports = { UserRepository };
```

---

## Service

```js
// src/modules/user/user.service.js
const { NotFoundError, ConflictError } = require('../../shared/app.error');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) throw new ConflictError('Email is already in use');
    }

    if (data.phone && data.phone !== user.phone) {
      const existing = await this.userRepository.findByPhone(data.phone);
      if (existing) throw new ConflictError('Phone number is already in use');
    }

    const affectedCount = await this.userRepository.update(userId, data);
    if (affectedCount === 0) throw new NotFoundError('User');

    return this.userRepository.findById(userId);
  }
}

module.exports = { UserService };
```

---

## Controller

```js
// src/modules/user/user.controller.js
const { success } = require('../../shared/response.helper');
const { asyncHandler } = require('../../shared/async.handler');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.getProfile(req.user.id);
    return success(res, user);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.updateProfile(req.user.id, req.body);
    return success(res, user, 'Profile updated successfully');
  });
}

module.exports = { UserController };
```

---

## Routes (with DI wiring)

```js
// src/modules/user/user.routes.js
const { Router } = require('express');
const { User } = require('./user.model');
const { UserRepository } = require('./user.repository');
const { UserService } = require('./user.service');
const { UserController } = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateBody } = require('../../middleware/validate.middleware');
const { updateProfileSchema } = require('./user.validator');

const router = Router();

const userRepository = new UserRepository(User);
const userService    = new UserService(userRepository);
const userController = new UserController(userService);

router.use(authenticate);

router.get('/me',   (req, res, next) => userController.getProfile(req, res, next));
router.patch('/me', validateBody(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));

module.exports = router;
```

---

## Unit Tests

### Service

```js
// src/modules/user/__tests__/user.service.test.js
const { UserService } = require('../user.service');
const { NotFoundError, ConflictError } = require('../../../shared/app.error');

const makeRepo = (overrides = {}) => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  findByPhone: jest.fn(),
  update:      jest.fn(),
  ...overrides,
});

let repo, service;

beforeEach(() => {
  repo = makeRepo();
  service = new UserService(repo);
  jest.clearAllMocks();
});

describe('getProfile', () => {
  it('returns the user when found', async () => {
    const mockUser = { id: 1, email: 'jane@test.com' };
    repo.findById.mockResolvedValue(mockUser);

    const result = await service.getProfile(1);

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });

  it('throws NotFoundError when user does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getProfile(99)).rejects.toThrow(NotFoundError);
  });
});

describe('updateProfile', () => {
  const user = { id: 1, email: 'jane@test.com', phone: '+10000000001' };

  it('updates and returns the refreshed user', async () => {
    const updated = { ...user, name: 'Updated' };
    repo.findById.mockResolvedValueOnce(user).mockResolvedValueOnce(updated);
    repo.update.mockResolvedValue(1);

    const result = await service.updateProfile(1, { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('throws ConflictError when new email is taken', async () => {
    repo.findById.mockResolvedValue(user);
    repo.findByEmail.mockResolvedValue({ id: 2, email: 'taken@test.com' });

    await expect(service.updateProfile(1, { email: 'taken@test.com' })).rejects.toThrow(ConflictError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('does not check email uniqueness when email is unchanged', async () => {
    repo.findById.mockResolvedValueOnce(user).mockResolvedValueOnce(user);
    repo.update.mockResolvedValue(1);

    await service.updateProfile(1, { email: user.email });
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when update affects 0 rows', async () => {
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(0);
    await expect(service.updateProfile(1, { name: 'X' })).rejects.toThrow(NotFoundError);
  });
});
```

### Controller

```js
// src/modules/user/__tests__/user.controller.test.js
const { UserController } = require('../user.controller');
const { NotFoundError, ConflictError } = require('../../../shared/app.error');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const makeService = (overrides = {}) => ({
  getProfile:    jest.fn(),
  updateProfile: jest.fn(),
  ...overrides,
});

let userService, controller;

beforeEach(() => {
  userService = makeService();
  controller  = new UserController(userService);
  jest.clearAllMocks();
});

describe('getProfile', () => {
  it('returns 200 with user data', async () => {
    const mockUser = { id: 1, name: 'Jane' };
    userService.getProfile.mockResolvedValue(mockUser);

    const res = makeRes();
    await controller.getProfile({ user: { id: 1 } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUser }));
  });

  it('calls next with NotFoundError when user not found', async () => {
    userService.getProfile.mockRejectedValue(new NotFoundError('User'));
    const next = jest.fn();

    await controller.getProfile({ user: { id: 99 } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });
});
```

---

## Related Docs

- [Repository Pattern](../patterns/repository.md)
- [Dependency Injection](../patterns/dependency-injection.md)
- [Testing Strategy](../testing/strategy.md)
- [Auth Module](../auth/security.md)
