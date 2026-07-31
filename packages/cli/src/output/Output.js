/**
 * ANSI Color & Rich Console Formatting Output Renderer.
 */
export class Output {
  constructor(stream = process.stdout) {
    this.stream = stream;
  }

  write(text) {
    this.stream.write(text);
  }

  line(text = '') {
    this.stream.write(`${text}\n`);
  }

  success(message) {
    this.line(`\x1b[32m✔ ${message}\x1b[0m`);
  }

  info(message) {
    this.line(`\x1b[36mℹ ${message}\x1b[0m`);
  }

  warning(message) {
    this.line(`\x1b[33m⚠ ${message}\x1b[0m`);
  }

  error(message) {
    this.line(`\x1b[31m✖ ${message}\x1b[0m`);
  }

  box(title, message) {
    const border = '─'.repeat(Math.max(title.length, message.length) + 4);
    this.line(`\x1b[34m┌${border}┐`);
    this.line(`│  \x1b[1m${title}\x1b[22m\x1b[34m  │`);
    this.line(`│  ${message}  │`);
    this.line(`└${border}┘\x1b[0m`);
  }

  table(headers, rows) {
    this.line(`\x1b[1m${headers.join(' | ')}\x1b[0m`);
    this.line('-'.repeat(headers.join(' | ').length));
    for (const row of rows) {
      this.line(row.join(' | '));
    }
  }
}
