import MemoryDriver from "./MemoryDriver.js";

export class RedisDriver extends MemoryDriver {
  // Redis mockable driver extending MemoryDriver for development/testing
  constructor(client = null) {
    super();
    this.client = client;
  }
}

export default RedisDriver;
