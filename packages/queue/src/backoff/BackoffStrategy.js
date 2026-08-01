export class BackoffStrategy {
  getBackoff(attempt) {
    throw new Error("Method not implemented.");
  }
}

export class FixedBackoff extends BackoffStrategy {
  constructor(seconds = 5) {
    super();
    this.seconds = seconds;
  }

  getBackoff() {
    return this.seconds;
  }
}

export class LinearBackoff extends BackoffStrategy {
  constructor(stepSeconds = 5) {
    super();
    this.stepSeconds = stepSeconds;
  }

  getBackoff(attempt = 1) {
    return attempt * this.stepSeconds;
  }
}

export class ExponentialBackoff extends BackoffStrategy {
  constructor(initialSeconds = 2, maxSeconds = 300) {
    super();
    this.initialSeconds = initialSeconds;
    this.maxSeconds = maxSeconds;
  }

  getBackoff(attempt = 1) {
    const calculated = this.initialSeconds * Math.pow(2, Math.max(0, attempt - 1));
    return Math.min(calculated, this.maxSeconds);
  }
}

export default BackoffStrategy;
