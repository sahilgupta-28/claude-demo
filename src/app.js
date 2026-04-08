// Express application setup.
// Registers middleware, mounts routes, and attaches the error handler LAST.
// Does not start the HTTP server — that is server.js's responsibility.

const express    = require('express');
const swaggerUi  = require('swagger-ui-express');
const { swaggerSpec }      = require('./config/swagger');
const { errorMiddleware }  = require('./middleware/error.middleware');
const authRoutes           = require('./modules/auth/auth.routes');

const app = express();

// ── Core middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API docs (Swagger UI) ───────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle:  'Demo API Docs',
  swaggerOptions:   { persistAuthorization: true },
}));
app.get('/docs.json', (req, res) => res.json(swaggerSpec)); // raw spec for tooling

// ── Routes ──────────────────────────────────────────────────────────────────
// Auth routes are mounted at /api so the endpoint is POST /api/register
app.use('/api', authRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Route not found' });
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
