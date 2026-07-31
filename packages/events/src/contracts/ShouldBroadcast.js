export class ShouldBroadcast {
  static isShouldBroadcast(event) {
    if (!event) return false;
    if (typeof event.broadcastOn === "function") return true;
    return Boolean(event.shouldBroadcast);
  }
}

export default ShouldBroadcast;
