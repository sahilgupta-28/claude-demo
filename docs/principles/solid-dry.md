# SOLID & DRY Principles

Every class, module, and function in this codebase must follow these principles. Treat violations as bugs, not style preferences.

---

## S — Single Responsibility Principle (SRP)

Each class has exactly **one reason to change**.

```js
// WRONG — service does business logic AND sends email (two reasons to change)
class UserService {
  async register(data) {
    const user = await this.userRepo.create(data);
    await nodemailer.sendMail({ to: user.email, subject: 'Welcome' }); // violation
    return user;
  }
}

// CORRECT — email is delegated to a dedicated service
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async register(data) {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}
```

**Checklist:** If you can describe a class with "and", it has more than one responsibility.

---

## O — Open/Closed Principle (OCP)

Classes are **open for extension, closed for modification**.
Add new behavior through composition or strategy — never by editing existing conditionals.

```js
// WRONG — every new channel requires modifying this class
class NotificationService {
  send(type, message) {
    if (type === 'email') { /* ... */ }
    else if (type === 'sms') { /* ... */ }  // must edit to add 'push'
  }
}

// CORRECT — new channels are added by injecting a new strategy, no edits needed
class NotificationService {
  constructor(channels) {
    this.channels = channels; // Map<string, NotificationChannel>
  }

  async send(type, message) {
    const channel = this.channels.get(type);
    if (!channel) throw new Error(`Unknown notification channel: ${type}`);
    return channel.send(message);
  }
}
```

---

## L — Liskov Substitution Principle (LSP)

Derived classes must be **drop-in replacements** for their base class — they must honor the same contract without narrowing behavior.

```js
// Base contract — every repository promises these methods
class BaseRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async create(data) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

// Derived class fulfills the full contract — no surprises
class UserRepository extends BaseRepository {
  async findById(id) { return User.findByPk(id); }
  async create(data) { return User.create(data); }
  async update(id, data) { return User.update(data, { where: { id } }); }
  async delete(id) { return User.destroy({ where: { id } }); }
}
```

**Violation signal:** A subclass that throws `'Not allowed'` or `'Not implemented'` for an inherited method.

---

## I — Interface Segregation Principle (ISP)

Do not force classes to depend on methods they don't use.
**Split large abstractions into focused ones.**

```js
// WRONG — read-only service inherits and must silence write methods
class ReadOnlyUserService extends FullUserService {
  async createUser() { throw new Error('Not allowed'); } // violation
}

// CORRECT — separate reader and writer classes with focused interfaces
class UserReaderService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async getById(id) { return this.userRepository.findById(id); }
}

class UserWriterService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
}
```

---

## D — Dependency Inversion Principle (DIP)

High-level modules must depend on **abstractions**, not on concrete implementations.
Inject dependencies from outside rather than constructing them inside.

```js
// WRONG — service is tightly coupled to a specific implementation
class UserService {
  constructor() {
    this.userRepository = new UserRepository(); // cannot be swapped or mocked
  }
}

// CORRECT — dependency is injected; any compatible repository works
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository; // testable, swappable
  }
}
```

See [Dependency Injection](../patterns/dependency-injection.md) for the wiring pattern.

---

## DRY — Don't Repeat Yourself

Every piece of knowledge must have a **single, authoritative representation**.

| Rule | How |
|------|-----|
| Shared query logic | Extend `BaseRepository`, never copy methods |
| Response formatting | Use `response.helper` in every controller |
| Validation rules | Define Joi schemas once per module, never inline |
| Error types | Extend `AppError` — never hardcode status codes in services |
| Config values | Read from `env.js` — never access `process.env` directly outside config |

**Warning signs of DRY violations:**
- Copy-pasted `try/catch` blocks across controllers → use `asyncHandler`.
- The same Sequelize query in two files → move it to the repository.
- The same validation logic in controller AND service → keep it only in the validator.

---

## Related Docs

- [Dependency Injection pattern](../patterns/dependency-injection.md)
- [Repository pattern](../patterns/repository.md)
- [Error Handling](../standards/error-handling.md)
