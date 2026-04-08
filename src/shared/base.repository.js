// Generic CRUD base class. Every module repository extends this via inheritance.
// Do not add business logic here — queries only.

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const [affectedCount] = await this.model.update(data, { where: { id }, ...options });
    return affectedCount;
  }

  async delete(id, options = {}) {
    return this.model.destroy({ where: { id }, ...options });
  }

  async transaction(callback) {
    return this.model.sequelize.transaction(callback);
  }
}

module.exports = { BaseRepository };
