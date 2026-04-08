// Single source of truth for environment variables.
// All process.env reads happen here — nothing else imports process.env directly.

require('dotenv').config();

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  db: {
    host:     required('DB_HOST'),
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    name:     required('DB_NAME'),
    user:     required('DB_USER'),
    password: required('DB_PASSWORD'),
  },
};
