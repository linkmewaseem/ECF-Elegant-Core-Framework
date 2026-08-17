import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { Command } from '../kernel/Command.js';

export class EcfServeCommand extends Command {
  constructor() {
    super();
    this.signature = 'serve {--port=3000} {--host=127.0.0.1} {--cluster} {--workers=0} {--entry=public/index.js}';
    this.description = 'Start HTTP application server with optional multi-core clustering';
  }

  async handle(input, output) {
    const options = input ? (input.options || {}) : {};
    const port = options.port || process.env.PORT || '3000';
    const host = options.host || process.env.HOST || '127.0.0.1';
    const entry = options.entry || 'public/index.js';
    const isCluster = Boolean(options.cluster || process.env.ECF_CLUSTER === 'true');
    const requestedWorkers = parseInt(options.workers, 10) || 0;

    const entryPath = path.resolve(process.cwd(), entry);

    // If entry file does not exist, check fallback index.js
    let targetFile = entryPath;
    if (!fs.existsSync(entryPath)) {
      const fallbackPath = path.resolve(process.cwd(), 'index.js');
      if (fs.existsSync(fallbackPath)) {
        targetFile = fallbackPath;
      }
    }

    const isPrimary = cluster.isPrimary ?? cluster.isMaster;

    if (isCluster && isPrimary) {
      const availableCpus = os.cpus().length;
      const workerCount = requestedWorkers > 0 ? requestedWorkers : availableCpus;

      if (output && typeof output.box === 'function') {
        output.box(
          `ECF Cluster Mode Activated\n` +
          `Primary PID  : ${process.pid}\n` +
          `CPU Cores    : ${availableCpus}\n` +
          `Workers      : ${workerCount}\n` +
          `Host/Port    : http://${host}:${port}`,
          'ecf serve --cluster'
        );
      } else if (output && typeof output.line === 'function') {
        output.line(`[ECF Cluster] Primary PID ${process.pid} running with ${workerCount} workers...`);
      }

      const activeWorkers = new Set();
      let isShuttingDown = false;

      // Environment overrides for worker processes
      process.env.PORT = String(port);
      process.env.HOST = String(host);
      process.env.ECF_CLUSTER_WORKER = 'true';

      // Fork workers
      for (let i = 0; i < workerCount; i++) {
        const worker = cluster.fork({ WORKER_ID: String(i + 1) });
        activeWorkers.add(worker);
      }

      // Auto-restart dead workers unless shutting down
      cluster.on('exit', (worker, code, signal) => {
        activeWorkers.delete(worker);
        if (!isShuttingDown) {
          if (output && typeof output.line === 'function') {
            output.line(`\x1b[33m[ECF Cluster]\x1b[0m Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Respawning...`);
          }
          const newWorker = cluster.fork();
          activeWorkers.add(newWorker);
        }
      });

      // Handle graceful termination
      const shutdown = (sig) => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        if (output && typeof output.line === 'function') {
          output.line(`\n\x1b[36m[ECF Cluster]\x1b[0m Received ${sig}. Shutting down ${activeWorkers.size} workers gracefully...`);
        }

        for (const worker of activeWorkers) {
          try {
            worker.kill(sig);
          } catch (_) {
            // Ignore kill errors
          }
        }

        setTimeout(() => {
          process.exit(0);
        }, 1000).unref();
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));

      return {
        mode: 'cluster-primary',
        primaryPid: process.pid,
        workerCount,
        workers: Array.from(activeWorkers).map(w => w.process.pid)
      };
    } else {
      // Single process or Cluster worker execution
      process.env.PORT = String(port);
      process.env.HOST = String(host);

      const workerId = process.env.WORKER_ID ? ` (Worker #${process.env.WORKER_ID} PID ${process.pid})` : '';

      if (!isCluster && output && typeof output.line === 'function') {
        output.line(`\x1b[32m[ECF Serve]\x1b[0m Server running at \x1b[1mhttp://${host}:${port}\x1b[0m${workerId}`);
      }

      if (fs.existsSync(targetFile)) {
        await import(`file://${targetFile}`);
      } else if (output && typeof output.line === 'function') {
        output.line(`\x1b[33m[ECF Serve Warning]\x1b[0m Entry file not found at ${targetFile}`);
      }

      return {
        mode: isCluster ? 'cluster-worker' : 'single',
        pid: process.pid,
        port,
        host,
        targetFile
      };
    }
  }
}
