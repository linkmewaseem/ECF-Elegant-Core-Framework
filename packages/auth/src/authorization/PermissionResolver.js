import IPermissionResolver from "../contracts/IPermissionResolver.js";

export class PermissionResolver extends IPermissionResolver {
  constructor(resolverCallback = null) {
    super();
    this.resolverCallback = resolverCallback;
    this.cache = new WeakMap();
  }

  async getPermissions(user) {
    if (!user) return [];
    if (this.cache.has(user)) {
      return this.cache.get(user);
    }

    let permissions = [];
    if (typeof user.getPermissions === "function") {
      permissions = await user.getPermissions();
    } else if (Array.isArray(user.permissions)) {
      permissions = user.permissions;
    } else if (this.resolverCallback) {
      permissions = await this.resolverCallback(user);
    }

    this.cache.set(user, permissions);
    return permissions;
  }

  async getRoles(user) {
    if (!user) return [];
    if (typeof user.getRoles === "function") {
      return user.getRoles();
    }
    if (Array.isArray(user.roles)) {
      return user.roles;
    }
    return [];
  }

  async hasPermission(user, permission) {
    const permissions = await this.getPermissions(user);
    return permissions.includes(permission) || permissions.includes("*");
  }

  async hasRole(user, role) {
    const roles = await this.getRoles(user);
    return roles.includes(role) || roles.includes("admin");
  }
}

export default PermissionResolver;
