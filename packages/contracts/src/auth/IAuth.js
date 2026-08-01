export class IAuthManager {
  guard(name = null) { throw new Error("Contract interface method."); }
  user() { throw new Error("Contract interface method."); }
}

export class IGuard {
  user() { throw new Error("Contract interface method."); }
  check() { throw new Error("Contract interface method."); }
}
