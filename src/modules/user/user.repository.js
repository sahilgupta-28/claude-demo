// User-specific query methods. Inherits generic CRUD from BaseRepository.
// Business logic does not belong here — queries and DB access only.

const { BaseRepository } = require('../../shared/base.repository');

class UserRepository extends BaseRepository {
  constructor(UserModel) {
    super(UserModel);
  }

  // Returns user WITHOUT passwordHash (uses defaultScope)
  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  // Returns user WITH passwordHash — used only during login / auth checks
  async findByEmailWithSensitive(email) {
    return this.model.scope('withSensitive').findOne({ where: { email } });
  }
}

module.exports = { UserRepository };
