import test from "node:test";
import assert from "node:assert/strict";
import Mailable from "../../src/mailable/Mailable.js";
import Attachment from "../../src/attachments/Attachment.js";

class WelcomeUserMailable extends Mailable {
  constructor(userName) {
    super();
    this.subject("Welcome to ECF Ecosystem!");
    this.html(`<h1>Hello ${userName}</h1>`);
    this.attach(Attachment.fromBuffer(Buffer.from("Hello"), "welcome.txt"));
  }
}

test("Mailable - envelope, content, and attachment builder", () => {
  const mailable = new WelcomeUserMailable("Waseem");
  mailable.to("waseem@example.com");

  const env = mailable.envelope();
  assert.equal(env.subject, "Welcome to ECF Ecosystem!");
  assert.deepEqual(env.to, ["waseem@example.com"]);

  const content = mailable.content();
  assert.equal(content.html, "<h1>Hello Waseem</h1>");

  const attachments = mailable.attachments();
  assert.equal(attachments.length, 1);
  assert.equal(attachments[0].name, "welcome.txt");
});
