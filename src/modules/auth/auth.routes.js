// Auth routes. Dependency injection is wired here so no module imports another module directly.
// Swagger @swagger annotations must be updated whenever the route or validator changes.

const { Router } = require('express');
const { User }           = require('../user/user.model');
const { UserRepository } = require('../user/user.repository');
const { AuthService }    = require('./auth.service');
const { AuthController } = require('./auth.controller');
const { validateBody }   = require('../../middleware/validate.middleware');
const { registerSchema } = require('./auth.validator');

const router = Router();

// Dependency injection: model → repository → service → controller
const userRepository = new UserRepository(User);
const authService    = new AuthService(userRepository);
const authController = new AuthController(authService);

/**
 * @swagger
 * /register:
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
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: '1234567890'
 *               address:
 *                 type: string
 *                 maxLength: 500
 *                 example: '123 Main St, Anytown, USA'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: 'Secret@123'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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
router.post(
  '/register',
  validateBody(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

module.exports = router;
