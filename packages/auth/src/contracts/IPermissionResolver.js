export class IPermissionResolver {
  getPermissions(user) { throw new Error("Method not implemented."); }
  getRoles(user) { throw new Error("Method not implemented."); }
  hasPermission(user, permission) { throw new Error("Method not implemented."); }
  hasRole(user, role) { throw new Error("Method not implemented."); }
}
export default IPermissionResolver;
