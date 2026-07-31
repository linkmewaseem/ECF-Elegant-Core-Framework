import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export class LockManager {
  constructor(lockDir = path.join(os.tmpdir(), "ecf-locks")) {
    this.lockDir = lockDir;
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  getLockPath(name) {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.lockDir, `${safeName}.lock`);
  }

  acquire(name) {
    const lockPath = this.getLockPath(name);
    if (fs.existsSync(lockPath)) {
      try {
        const pid = parseInt(fs.readFileSync(lockPath, "utf8"), 10);
        if (pid && this.isProcessRunning(pid)) {
          return false;
        }
      } catch (err) {
        // Stale lock file
      }
    }

    fs.writeFileSync(lockPath, process.pid.toString(), "utf8");
    return true;
  }

  release(name) {
    const lockPath = this.getLockPath(name);
    if (fs.existsSync(lockPath)) {
      try {
        fs.unlinkSync(lockPath);
      } catch (err) {}
    }
  }

  isProcessRunning(pid) {
    try {
      return process.kill(pid, 0);
    } catch (e) {
      return e.code === "EPERM";
    }
  }
}

export default LockManager;
