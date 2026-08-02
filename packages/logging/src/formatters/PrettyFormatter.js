import { BaseFormatter } from './BaseFormatter.js';
import { ExceptionFormatter } from './ExceptionFormatter.js';

/**
 * ANSI Colored Terminal Formatter.
 */
export class PrettyFormatter extends BaseFormatter {
  static COLORS = {
    emergency: '\x1b[41m\x1b[37m', // Red BG, White text
    alert: '\x1b[41m\x1b[37m',
    critical: '\x1b[31m', // Red
    error: '\x1b[31m',
    warning: '\x1b[33m', // Yellow
    notice: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    debug: '\x1b[34m', // Blue
    trace: '\x1b[90m', // Gray
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
  };

  constructor() {
    super();
    this.exceptionFormatter = new ExceptionFormatter();
  }

  format(record) {
    const r = this.exceptionFormatter.format({ ...record });
    const levelLower = String(r.level || 'info').toLowerCase();
    const color = PrettyFormatter.COLORS[levelLower] || PrettyFormatter.COLORS.reset;
    const reset = PrettyFormatter.COLORS.reset;
    const dim = PrettyFormatter.COLORS.dim;
    const bold = PrettyFormatter.COLORS.bold;

    const timeStr = r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString();
    const levelStr = `${color}${bold}[${levelLower.toUpperCase()}]${reset}`;
    const channelStr = r.channel ? `${dim}(${r.channel})${reset}` : '';
    const messageStr = typeof r.message === 'string' ? r.message : JSON.stringify(r.message);

    let contextStr = '';
    if (r.context && Object.keys(r.context).length > 0) {
      contextStr = ` ${dim}${JSON.stringify(r.context)}${reset}`;
    }

    let traceStr = '';
    if (r.traceId) {
      traceStr = ` ${dim}[traceId:${r.traceId}]${reset}`;
    }

    let excStr = '';
    if (r.exception && r.exception.stack) {
      excStr = `\n${color}${r.exception.stack}${reset}`;
    }

    return `${dim}${timeStr}${reset} ${levelStr} ${channelStr}: ${messageStr}${contextStr}${traceStr}${excStr}`;
  }
}

export default PrettyFormatter;
