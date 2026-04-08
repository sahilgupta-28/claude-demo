# Swagger / OpenAPI Documentation

## Principle

**Swagger docs are part of the code, not an afterthought.**
Every API endpoint must have a `@swagger` JSDoc annotation on its route definition. When an endpoint is created or changed, its annotation is updated in the same edit.

---

## Setup

### Install

```bash
npm install swagger-jsdoc swagger-ui-express
```

### `src/config/swagger.js`

```js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'Authentication and User Profile API',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from POST /auth/login or /auth/signup',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data:    { type: 'object', nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code:    { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'email must be a valid email address' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string',  example: 'Jane Doe' },
            email:     { type: 'string',  format: 'email', example: 'jane@example.com' },
            phone:     { type: 'string',  example: '+14155552671' },
            address:   { type: 'string',  nullable: true },
            role:      { type: 'string',  enum: ['user', 'admin'] },
            isActive:  { type: 'boolean', example: true },
            createdAt: { type: 'string',  format: 'date-time' },
            updatedAt: { type: 'string',  format: 'date-time' },
          },
        },
        AuthPayload: {
          type: 'object',
          properties: {
            user:        { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', example: 'eyJhbGci...' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGci...' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };
```

### Mount in `src/app.js`

```js
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

// After core middleware, before routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Auth API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/docs.json', (req, res) => res.json(swaggerSpec)); // raw spec for tooling
```

UI is available at: **`http://localhost:3000/docs`**

---

## Annotation Format

Every annotation must include: `summary`, `tags`, `requestBody` (write routes), `responses` (all status codes), `security` (protected routes).

### Public POST route

```js
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 example: '+14155552671'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthPayload'
 *       409:
 *         description: Email or phone already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/signup', validateBody(signupSchema), (req, res, next) => authController.signup(req, res, next));
```

### Protected GET route

```js
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', (req, res, next) => userController.getProfile(req, res, next));
```

### Email-safe route (no enumeration)

```js
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: >
 *       Always returns HTTP 200 regardless of whether the email exists,
 *       preventing user enumeration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset instructions sent (if the email is registered)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
```

---

## Sync Rules

Never let an annotation drift from its implementation. Update both in the same edit.

| Change | Required annotation update |
|--------|---------------------------|
| New route added | Add `@swagger` block above the route |
| Request field added/removed | Update `requestBody` schema |
| Response shape changed | Update the `responses` entry |
| New status code possible | Add it to `responses` |
| Auth added/removed | Add or remove `security` block |
| Joi validator changed | Mirror the change in `requestBody` |

---

## Per-Endpoint Checklist

- [ ] `summary` — describes the action in plain English
- [ ] `tags` — groups correctly (`Auth`, `Users`, etc.)
- [ ] `requestBody` — present for POST / PUT / PATCH, all fields typed with examples
- [ ] `responses` — every possible HTTP status code listed
- [ ] Error responses use `$ref: '#/components/schemas/ErrorResponse'`
- [ ] Protected routes include `security: [{ bearerAuth: [] }]`
- [ ] Field types and constraints match the Joi validator

---

## Related Docs

- [Automation Hooks](../hooks/automation.md) — swagger sync hook
- [Validation](../standards/validation.md) — Joi schemas to mirror
- [Auth Security](../auth/security.md) — how to annotate protected routes
