export class ChannelRegistry {
  constructor() {
    this.channels = new Map();
  }

  register(name, channelInstance) {
    this.channels.set(name, channelInstance);
    return this;
  }

  get(name) {
    return this.channels.get(name) || null;
  }

  has(name) {
    return this.channels.has(name);
  }
}

export default ChannelRegistry;
