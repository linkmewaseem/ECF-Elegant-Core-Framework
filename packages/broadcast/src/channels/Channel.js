export class Channel {
  constructor(name) {
    this.name = String(name);
  }

  isPrivate() {
    return false;
  }

  isPresence() {
    return false;
  }

  toString() {
    return this.name;
  }
}

export default Channel;
