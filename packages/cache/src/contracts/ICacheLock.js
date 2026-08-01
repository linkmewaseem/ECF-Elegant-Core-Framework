export class ICacheLock {
  acquire() { throw new Error("Method acquire() must be implemented."); }
  release() { throw new Error("Method release() must be implemented."); }
  owner() { throw new Error("Method owner() must be implemented."); }
  isOwned() { throw new Error("Method isOwned() must be implemented."); }
  forceRelease() { throw new Error("Method forceRelease() must be implemented."); }
}

export default ICacheLock;
