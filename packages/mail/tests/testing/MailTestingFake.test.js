import test from "node:test";
import assert from "node:assert/strict";
import Mailable from "../../src/mailable/Mailable.js";
import MailTestingFake from "../../src/testing/MailTestingFake.js";

class OrderInvoiceMailable extends Mailable {}

test("MailTestingFake - assertions for sent and queued emails", async () => {
  const fake = new MailTestingFake();
  const mailable = new OrderInvoiceMailable();

  await fake.to("user@example.com").send(mailable);

  fake.assertSent(OrderInvoiceMailable);
  fake.assertSentTo("user@example.com", OrderInvoiceMailable);
});
