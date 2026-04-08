// User schema. Sensitive columns (passwordHash, tokens) are excluded from the
// defaultScope so they are never accidentally returned in API responses.
// Use .scope('withSensitive') in auth code when you need them.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type:          DataTypes.INTEGER.UNSIGNED,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type:      DataTypes.STRING(150),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    phone: {
      type:      DataTypes.STRING(20),
      allowNull: false,
      unique:    true,
    },
    address: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    // Never store or return the plaintext password
    passwordHash: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type:         DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
    isActive: {
      type:         DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    paranoid:  true, // soft deletes via deleted_at

    // All normal queries exclude sensitive columns automatically
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      // Auth code opts in with User.scope('withSensitive')
      withSensitive: { attributes: {} },
    },
  }
);

module.exports = { User };
