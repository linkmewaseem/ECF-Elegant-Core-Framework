export class Notification {
  currentLocale: string;
  via(notifiable: any): string[];
  locale(loc: string): this;
  setIdempotencyKey(key: string): this;
  idempotencyKey(): string;
  middleware(): any[];
}

export class DigestNotification extends Notification {
  addNotification(notification: Notification): this;
}

export class DatabaseNotificationRecord {
  id: string;
  type: string;
  notifiableId: any;
  data: any;
  readAt: Date | null;
  createdAt: Date;
  markAsRead(): this;
  markAsUnread(): this;
  isRead(): boolean;
  isUnread(): boolean;
}

export class AnonymousNotifiable {
  route(channel: string, target: any): this;
  routeNotificationFor(channel: string): any;
  notify(notification: Notification, manager?: any): Promise<any>;
}

export class NotificationException extends Error {
  status: number;
  code: string;
}
export class ChannelDeliveryException extends NotificationException {}

export class NotificationTestingFake {
  send(notifiables: any, notification: Notification): Promise<boolean>;
  assertSentTo(notifiable: any, notificationClass: any): void;
  assertNotSentTo(notifiable: any, notificationClass: any): void;
  assertCount(count: number): void;
}

export class NotificationServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const NotificationFacade: any;
