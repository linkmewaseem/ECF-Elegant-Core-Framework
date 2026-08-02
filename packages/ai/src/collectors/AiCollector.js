/**
 * DevTools Collector for AI telemetry & token costs.
 */
export class AiCollector {
  #events = [];

  record(event) {
    this.#events.push({ ...event, timestamp: Date.now() });
  }

  collect() {
    return [...this.#events];
  }
}

export default AiCollector;
