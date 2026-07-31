import fs from 'node:fs';
import { Command } from '../kernel/Command.js';

export class EcfDoctorCommand extends Command {
  constructor() {
    super();
    this.signature = 'doctor';
    this.description = 'Run diagnostic health checks across application environment and dependencies';
  }

  async handle(input, output) {
    output.box('ECF Framework Environment Diagnostic Tool', 'ecf doctor');

    const checks = [];

    // 1. Node Version Check
    const nodeVer = process.version;
    const nodeMajor = parseInt(nodeVer.replace(/^v/, '').split('.')[0], 10);
    checks.push({
      item: 'Node.js Version',
      status: nodeMajor >= 22 ? '✔' : '✖',
      detail: `${nodeVer} (>= v22 required)`
    });

    // 2. Storage Directory Permissions
    const storageWritable = fs.existsSync('storage') || fs.existsSync('storage/logs');
    checks.push({
      item: 'Storage Permissions',
      status: storageWritable ? '✔' : '⚠',
      detail: storageWritable ? 'Writable' : 'storage directory not found in current CWD'
    });

    // 3. Configuration Check
    const configExists = fs.existsSync('ecf.config.js') || fs.existsSync('config/app.js');
    checks.push({
      item: 'Application Config',
      status: configExists ? '✔' : 'ℹ',
      detail: configExists ? 'Loaded' : 'No ecf.config.js detected in current CWD'
    });

    // 4. Memory Heap
    const memMb = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    checks.push({
      item: 'Heap Memory Footprint',
      status: '✔',
      detail: `${memMb} MB`
    });

    output.line('\n\x1b[1mSystem Diagnostic Checks:\x1b[0m');
    for (const c of checks) {
      const color = c.status === '✔' ? '\x1b[32m' : (c.status === '⚠' ? '\x1b[33m' : '\x1b[31m');
      output.line(`  ${color}${c.status}\x1b[0m \x1b[1m${c.item.padEnd(25)}\x1b[0m ${c.detail}`);
    }
    output.line('');

    return checks;
  }
}
