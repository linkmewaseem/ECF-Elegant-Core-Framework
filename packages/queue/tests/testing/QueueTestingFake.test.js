import test from "node:test";
import assert from "node:assert/strict";
import Job from "../../src/core/Job.js";
import QueueTestingFake from "../../src/testing/QueueTestingFake.js";

class SendEmailJob extends Job {}
class ProcessVideoJob extends Job {}

test("QueueTestingFake - assertions for pushed jobs", () => {
  const fake = new QueueTestingFake();

  fake.push(new SendEmailJob(), {}, "emails");

  fake.assertPushed(SendEmailJob);
  fake.assertPushedOn("emails", SendEmailJob);
  fake.assertNotPushed(ProcessVideoJob);
});
