export class IScheduleTask {
  isDue(date = new Date(), timezone = null) {
    throw new Error('Contract method.');
  }

  run(container = null) {
    throw new Error('Contract method.');
  }

  expression() {
    throw new Error('Contract method.');
  }

  name() {
    throw new Error('Contract method.');
  }
}

export default IScheduleTask;
