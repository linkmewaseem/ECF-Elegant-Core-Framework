import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import QueueServiceProvider from "../../../queue/src/providers/QueueServiceProvider.js";
import StorageServiceProvider from "../../../storage/src/providers/StorageServiceProvider.js";
import MailServiceProvider from "../../src/providers/MailServiceProvider.js";
import MailFacade from "../../src/facades/MailFacade.js";
import Mailable from "../../src/mailable/Mailable.js";
import Attachment from "../../src/attachments/Attachment.js";

class IntegrationInvoiceMail extends Mailable {}

test("MailQueueStorageIntegration - IoC container, Queue delegation, and Storage attachment", async () => {
  const app = new Application();
  app.register(QueueServiceProvider);
  app.register(StorageServiceProvider);
  app.register(MailServiceProvider);
  app.boot();

  MailFacade.setApplication(app);

  const storage = app.make("storage");
  await storage.disk("local").put("invoices/inv_1.pdf", "PDF-CONTENT");

  const attachment = await Attachment.fromStorage(storage, "invoices/inv_1.pdf", "local");
  assert.equal(attachment.name, "inv_1.pdf");

  const fakeMail = MailFacade.fake();
  const mailable = new IntegrationInvoiceMail().attach(attachment);

  await MailFacade.to("client@company.com").send(mailable);

  fakeMail.assertSent(IntegrationInvoiceMail);
});
