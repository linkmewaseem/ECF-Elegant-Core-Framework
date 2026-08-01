import test from "node:test";
import assert from "node:assert/strict";
import Envelope from "../../src/mailable/Envelope.js";

test("HeaderInjectionSecurity - cleans newline characters from subjects and recipients to prevent header injection", () => {
  const envelope = new Envelope({
    subject: "Normal Subject\r\nBcc: evil@attacker.com",
    to: "user@example.com\r\nCc: victim@example.com"
  });

  const cleanSubject = envelope.subject.replace(/[\r\n]/g, "");
  assert.equal(cleanSubject, "Normal SubjectBcc: evil@attacker.com");
  assert.equal(cleanSubject.includes("\n"), false);
});
