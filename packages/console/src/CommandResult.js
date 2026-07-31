export class CommandResult {
  constructor(status = "success", exitCode = 0, message = "", data = {}) {
    this.status = status;
    this.exitCode = exitCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(message = "Command executed successfully", data = {}) {
    return new CommandResult("success", 0, message, data);
  }

  static failed(message = "Command failed execution", exitCode = 1, data = {}) {
    return new CommandResult("failed", exitCode, message, data);
  }

  static warning(message = "Command completed with warnings", data = {}) {
    return new CommandResult("warning", 0, message, data);
  }

  static skipped(reason = "Command skipped execution") {
    return new CommandResult("skipped", 0, reason);
  }
}

export default CommandResult;
