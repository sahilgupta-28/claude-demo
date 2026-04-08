# Naming Conventions

Consistent naming makes the codebase predictable. Any new file, class, variable, or database column should fit this table without exception.

---

## Conventions Table

| Artifact              | Convention            | Example                          |
|-----------------------|-----------------------|----------------------------------|
| Source files          | `kebab-case`          | `user.service.js`                |
| Classes               | `PascalCase`          | `UserService`, `BaseRepository`  |
| Methods & functions   | `camelCase`           | `findByEmail()`, `createUser()`  |
| Variables             | `camelCase`           | `const userList`, `let affectedCount` |
| Constants             | `UPPER_SNAKE_CASE`    | `const SALT_ROUNDS = 12`         |
| Environment variables | `UPPER_SNAKE_CASE`    | `JWT_ACCESS_SECRET`              |
| Database tables       | `snake_case` plural   | `users`, `order_items`           |
| Database columns      | `snake_case`          | `created_at`, `password_hash`    |
| ORM field names       | `camelCase`           | `passwordHash`, `createdAt`      |
| API routes            | `kebab-case` plural   | `/api/users`, `/api/order-items` |
| HTTP methods          | REST semantics        | `GET /users`, `POST /users/:id`  |
| Test files            | `[module].test.js`    | `user.service.test.js`           |
| Test descriptions     | Sentence case         | `'returns a user when found'`    |
| Error codes           | `UPPER_SNAKE_CASE`    | `'NOT_FOUND'`, `'CONFLICT'`      |

---

## File Naming Pattern

Every module file follows `[domain].[layer].js`:

```
user.model.js
user.repository.js
user.service.js
user.controller.js
user.routes.js
user.validator.js
```

Test files follow `[domain].[layer].test.js` inside `__tests__/`:

```
__tests__/
  user.service.test.js
  user.controller.test.js
  user.repository.test.js
```

---

## REST Endpoint Conventions

| Action         | Method   | Path              |
|----------------|----------|-------------------|
| List resources | `GET`    | `/api/users`      |
| Get one        | `GET`    | `/api/users/:id`  |
| Create         | `POST`   | `/api/users`      |
| Full replace   | `PUT`    | `/api/users/:id`  |
| Partial update | `PATCH`  | `/api/users/:id`  |
| Delete         | `DELETE` | `/api/users/:id`  |
| Non-CRUD action| `POST`   | `/api/auth/login` |

Route paths are always `kebab-case` and pluralized for resource collections.

---

## Related Docs

- [Folder Structure](folder-structure.md)
- [Architecture Overview](../architecture/overview.md)
