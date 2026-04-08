// Auth controller. Owns HTTP only: reading req, calling the service, sending res.
// No business logic here — that belongs in AuthService.

const { created } = require('../../shared/response.helper');
const { asyncHandler } = require('../../shared/async.handler');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  // POST /api/register
  register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body);
    return created(res, user, 'User registered successfully');
  });
}

module.exports = { AuthController };
