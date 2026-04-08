// Auth business logic. This layer owns rules like "email must be unique"
// and password hashing. It never references HTTP or res/req objects.

const bcrypt = require('bcrypt');
const { ConflictError } = require('../../shared/app.error');

const SALT_ROUNDS = 12; // bcrypt cost factor — never lower than 10 in production

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Registers a new user.
   * - Checks uniqueness of email and phone before writing.
   * - Hashes the plaintext password; the hash alone is persisted.
   * - Returns the created user record (passwordHash excluded by model's defaultScope).
   */
  async register({ name, email, phone, address, password }) {
    // Uniqueness checks — done here (service layer) not in the DB trigger,
    // so we can return a meaningful domain error rather than a raw DB exception.
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new ConflictError('Email is already registered');

    const existingPhone = await this.userRepository.findByPhone(phone);
    if (existingPhone) throw new ConflictError('Phone number is already registered');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      name,
      email,
      phone,
      address: address || null,
      passwordHash,
    });

    return user; // passwordHash is excluded by the model's defaultScope
  }
}

module.exports = { AuthService };
