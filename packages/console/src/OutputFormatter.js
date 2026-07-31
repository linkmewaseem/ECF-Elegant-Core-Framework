export class OutputFormatter {
  constructor(stream = process.stdout) {
    this.stream = stream;
  }

  write(text) {
    this.stream.write(text);
  }

  line(text = "") {
    this.write(`${text}\n`);
  }

  info(text) {
    this.line(`\x1b[36mℹ ${text}\x1b[0m`);
  }

  success(text) {
    this.line(`\x1b[32m✔ ${text}\x1b[0m`);
  }

  warn(text) {
    this.line(`\x1b[33m⚠ ${text}\x1b[0m`);
  }

  error(text) {
    this.line(`\x1b[31m✖ ${text}\x1b[0m`);
  }

  note(text) {
    this.line(`\x1b[90m> ${text}\x1b[0m`);
  }

  panel(title, content) {
    this.line(`\x1b[44m\x1b[37m ${title} \x1b[0m`);
    this.line(`  ${content}`);
  }

  json(obj) {
    this.line(JSON.stringify(obj, null, 2));
  }

  table(headers, rows) {
    if (!headers || !rows) return;
    this.line(headers.join("\t|\t"));
    this.line("-".repeat(40));
    for (const row of rows) {
      this.line(row.join("\t|\t"));
    }
  }

  progress(current, total, title = "Progress") {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round(percentage / 5);
    const bar = "█".repeat(filled) + "-".repeat(20 - filled);
    this.write(`\r\x1b[36m${title}: [${bar}] ${percentage}%\x1b[0m`);
    if (current >= total) this.line();
  }
}

export default OutputFormatter;
