import { Broadcast } from '@ecf/broadcast';

export function createChatServer() {
  return {
    async sendMessage({ channel, message, sender }) {
      if (globalThis.__ECF_BROADCAST__) {
        await Broadcast.broadcast(channel, 'MessageSent', { sender, message });
      }
      return { success: true, channel, message, sender };
    },
  };
}
