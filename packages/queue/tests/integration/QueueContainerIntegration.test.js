import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import QueueServiceProvider from "../../src/providers/QueueServiceProvider.js";
import QueueFacade from "../../src/facades/QueueFacade.js";
import Job from "../../src/core/Job.js";

let jobExecuted = false;

class ContainerJob extends Job {
  async handle() { jobExecuted = true; }
}

test("QueueContainerIntegration - IoC container, Facade, and static Job.dispatch()", async () => {
  const app = new Application();
  app.register(QueueServiceProvider);
  app.boot();

  QueueFacade.setApplication(app);

  const fakeQueue = QueueFacade.fake();
  await ContainerJob.dispatch({ id: 1 });

  fakeQueue.assertPushed(ContainerJob);
});
