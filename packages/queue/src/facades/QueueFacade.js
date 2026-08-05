import { Facade } from "@ecfjs/core";

export class QueueFacadeClass extends Facade {
  static accessor() {
    return "queue";
  }
}

export const Queue = Facade.create(QueueFacadeClass);
export default Queue;
