export class INotificationManager {
  send(notifiables, notification) { throw new Error("Method not implemented."); }
  sendNow(notifiables, notification, channels) { throw new Error("Method not implemented."); }
  channel(name) { throw new Error("Method not implemented."); }
  fake() { throw new Error("Method not implemented."); }
}
export default INotificationManager;
