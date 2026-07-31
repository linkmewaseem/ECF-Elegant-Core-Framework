export class EventSubscriber {
  subscribe(dispatcher) {
    throw new Error(`EventSubscriber [${this.constructor.name}] must implement subscribe(dispatcher).`);
  }
}

export default EventSubscriber;
