import Channel from "./Channel.js";

export class PresenceChannel extends Channel {
  constructor(name) {
    const channelName = name.startsWith("presence-") ? name : `presence-${name}`;
    super(channelName);
  }

  isPrivate() {
    return true;
  }

  isPresence() {
    return true;
  }
}

export default PresenceChannel;
