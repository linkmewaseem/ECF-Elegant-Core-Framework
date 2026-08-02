import Channel from "./Channel.js";

export class PrivateChannel extends Channel {
  constructor(name) {
    const channelName = name.startsWith("private-") ? name : `private-${name}`;
    super(channelName);
  }

  isPrivate() {
    return true;
  }
}

export default PrivateChannel;
