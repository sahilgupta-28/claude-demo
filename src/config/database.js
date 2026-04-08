// Sequelize connection and connection-pool configuration.
// underscored: true maps camelCase JS fields to snake_case DB columns automatically.

const { Sequelize } = require('sequelize');
const { db, NODE_ENV } = require('./env');

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host:    db.host,
  port:    db.port,
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: {
    underscored: true, // camelCase fields → snake_case columns (e.g. passwordHash → password_hash)
    timestamps:  true,
    paranoid:    true, // soft deletes — sets deleted_at instead of removing rows
  },
});

module.exports = { sequelize };
