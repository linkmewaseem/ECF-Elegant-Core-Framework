/**
 * Base Policy class for resource authorization checks.
 */
export class Policy {
  async viewAny(user) {
    return true;
  }

  async view(user, resource) {
    return true;
  }

  async create(user) {
    return true;
  }

  async update(user, resource) {
    return true;
  }

  async delete(user, resource) {
    return true;
  }
}
