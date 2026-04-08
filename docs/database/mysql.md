# Database — MySQL Schema Design

## General Rules

| Rule | Detail |
|------|--------|
| Primary key | Every table must have an explicit `id` (INT UNSIGNED AUTO_INCREMENT or UUID) |
| Timestamps | Always use `timestamps: true` — Sequelize manages `created_at` / `updated_at` |
| Soft deletes | Use `paranoid: true` — rows get a `deleted_at` timestamp instead of being removed |
| Foreign keys | Define FK constraints at the **database level**, not only in the ORM |
| Transactions | Wrap all multi-step write operations in a Sequelize transaction |

---

## Sequelize Connection Config

```js
// src/config/database.js
const { Sequelize } = require('sequelize');
const { db, NODE_ENV } = require('./env');

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: {
    underscored: true,   // camelCase JS fields → snake_case DB columns
    timestamps: true,
    paranoid: true,      // enables soft deletes via deleted_at column
  },
});

module.exports = { sequelize };
```

---

## Model Definition Pattern

```js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    paranoid: true,
    // Default scope hides sensitive columns from all normal queries
    defaultScope: {
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'refreshTokenHash'] },
    },
    scopes: {
      withSensitive: { attributes: {} }, // opt-in to sensitive fields in auth code
    },
  }
);

module.exports = { User };
```

---

## Association Patterns

```js
// One-to-Many: User has many Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Many-to-Many: Order has many Products through OrderItems
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'order_id', as: 'products' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'product_id', as: 'orders' });
```

Define all associations in a central `src/config/associations.js` file, required once in `app.js`, so models never import each other.

---

## Transaction Usage

```js
// src/modules/order/order.service.js
async createOrderWithItems(orderData, items) {
  return this.orderRepository.transaction(async (t) => {
    const order = await this.orderRepository.create(orderData, { transaction: t });
    for (const item of items) {
      await this.orderItemRepository.create({ ...item, orderId: order.id }, { transaction: t });
    }
    return order;
  });
}
```

If any step throws, the entire transaction rolls back automatically.

---

## Soft Delete Behavior

With `paranoid: true`:

| Operation | Behavior |
|-----------|----------|
| `destroy()` | Sets `deleted_at = NOW()`, row stays in DB |
| `findAll()` | Automatically excludes rows where `deleted_at IS NOT NULL` |
| `findOne({ paranoid: false })` | Returns deleted rows explicitly |
| `restore()` | Clears `deleted_at`, un-deletes the row |

---

## Related Docs

- [Repository Pattern](../patterns/repository.md)
- [Naming Conventions](../standards/naming.md)
