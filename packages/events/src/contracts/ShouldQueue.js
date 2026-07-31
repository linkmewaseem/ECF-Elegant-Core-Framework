export class ShouldQueue {
  static isShouldQueue(listenerOrEvent) {
    if (!listenerOrEvent) return false;
    if (typeof listenerOrEvent.shouldQueue === "function") {
      return listenerOrEvent.shouldQueue();
    }
    return Boolean(listenerOrEvent.shouldQueue);
  }
}

export default ShouldQueue;
