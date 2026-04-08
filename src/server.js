// Entry point. Authenticates the DB connection before accepting HTTP traffic.
// If the DB is unreachable at startup the process exits immediately with a clear error.

const app             = require('./app');
const { sequelize }   = require('./config/database');
const { PORT }        = require('./config/env');

const start = async () => {
  try {
    // Verify DB connectivity — sync({ alter: true }) updates column definitions
    // without dropping data. Use sync({ force: true }) only in dev when you need a clean slate.
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API docs available at http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
