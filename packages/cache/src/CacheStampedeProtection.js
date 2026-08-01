export class CacheStampedeProtection {
  constructor() {
    this.flights = new Map();
  }

  async execute(key, callback) {
    if (this.flights.has(key)) {
      return await this.flights.get(key);
    }

    const promise = (async () => {
      return await callback();
    })();

    this.flights.set(key, promise);

    try {
      return await promise;
    } finally {
      this.flights.delete(key);
    }
  }
}

export default CacheStampedeProtection;


