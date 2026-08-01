import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import QueueServiceProvider from "../../../queue/src/providers/QueueServiceProvider.js";
import MailServiceProvider from "../../../mail/src/providers/MailServiceProvider.js";
import NotificationServiceProvider from "../../src/providers/NotificationServiceProvider.js";
import NotificationFacade from "../../src/facades/NotificationFacade.js";
import Notification from "../../src/notification/Notification.js";
import AnonymousNotifiable from "../../src/notifiable/AnonymousNotifiable.js";

class IntegrationSystemNotification extends Notification {
  via() { return ["mail", "database"]; }
  toMail() { return { subject: "System Alert" }; }
  toDatabase() { return { alert: "High CPU usage" }; }
}

test("NotificationsIntegration - IoC container, Facade, AnonymousNotifiable, and fake harness", async () => {
  const app = new Application();
  app.register(QueueServiceProvider);
  app.register(MailServiceProvider);
  app.register(NotificationServiceProvider);
  app.boot();

  NotificationFacade.setApplication(app);

  const fakeNotif = NotificationFacade.fake();
  const target = new AnonymousNotifiable().route("mail", "admin@company.com");

  await NotificationFacade.send(target, new IntegrationSystemNotification());

  fakeNotif.assertSentTo(target, IntegrationSystemNotification);
});
