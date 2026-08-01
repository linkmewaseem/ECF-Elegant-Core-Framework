export class QueueException extends Error {
  constructor(message = "Queue exception.", status = 500, code = "ERR_QUEUE") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class JobTimeoutException extends QueueException {
  constructor(jobName, timeoutSeconds) {
    super(`Job '${jobName}' timed out after ${timeoutSeconds} seconds.`, 504, "ERR_JOB_TIMEOUT");
    this.jobName = jobName;
    this.timeoutSeconds = timeoutSeconds;
  }
}

export class MaxAttemptsExceededException extends QueueException {
  constructor(jobName, maxAttempts) {
    super(`Job '${jobName}' exceeded maximum attempts (${maxAttempts}).`, 422, "ERR_MAX_ATTEMPTS_EXCEEDED");
    this.jobName = jobName;
    this.maxAttempts = maxAttempts;
  }
}

export class InvalidJobPayloadException extends QueueException {
  constructor(reason = "Payload signature or checksum mismatch.") {
    super(`Invalid job payload: ${reason}`, 400, "ERR_INVALID_JOB_PAYLOAD");
  }
}

export class QueueDriverException extends QueueException {
  constructor(driverName, reason) {
    super(`Queue driver '${driverName}' error: ${reason}`, 500, "ERR_QUEUE_DRIVER");
    this.driverName = driverName;
  }
}

export default QueueException;
