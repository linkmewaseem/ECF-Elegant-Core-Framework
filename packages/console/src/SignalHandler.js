export class SignalHandler {
  constructor() {
    this.listeners = new Set();
    this.installed = false;
  }

  install() {
    if (this.installed) return;
    this.installed = true;

    const onSignal = (signal) => {
      for (const listener of this.listeners) {
        try {
          listener(signal);
        } catch (err) {}
      }
    };

    process.on("SIGINT", () => onSignal("SIGINT"));
    process.on("SIGTERM", () => onSignal("SIGTERM"));
  }

  onShutdown(callback) {
    this.install();
    this.listeners.add(callback);
  }
}

export default SignalHandler;
