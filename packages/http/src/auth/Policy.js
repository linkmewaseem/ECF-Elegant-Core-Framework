import { IPolicy } from "@ecfjs/auth";

export class Policy extends IPolicy {
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

export default Policy;

