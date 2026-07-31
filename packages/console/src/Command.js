import SignatureParser from "./SignatureParser.js";
import OutputFormatter from "./OutputFormatter.js";
import PromptsEngine from "./PromptsEngine.js";
import CommandResult from "./CommandResult.js";

export class Command {
  signature = "";
  description = "";
  category = "system";
  hidden = false;
  middleware = [];

  constructor() {
    this.parsedSignature = null;
    this.output = new OutputFormatter();
    this.prompts = new PromptsEngine();
    this.input = null;
  }

  get name() {
    if (this.parsedSignature) return this.parsedSignature.name;
    if (this.signature) {
      this.parsedSignature = SignatureParser.parse(this.signature);
      return this.parsedSignature.name;
    }
    return this.constructor.name;
  }

  argument(name, defaultValue = null) {
    if (!this.input) return defaultValue;
    return this.input.argument(name, defaultValue);
  }

  option(name, defaultValue = null) {
    if (!this.input) return defaultValue;
    return this.input.option(name, defaultValue);
  }

  hasOption(name) {
    if (!this.input) return false;
    return this.input.hasOption(name);
  }

  info(text) {
    this.output.info(text);
  }

  success(text) {
    this.output.success(text);
  }

  warn(text) {
    this.output.warn(text);
  }

  error(text) {
    this.output.error(text);
  }

  line(text) {
    this.output.line(text);
  }

  table(headers, rows) {
    this.output.table(headers, rows);
  }

  progress(current, total, title) {
    this.output.progress(current, total, title);
  }

  async ask(question, defaultValue) {
    return this.prompts.ask(question, defaultValue);
  }

  async confirm(question, defaultValue) {
    return this.prompts.confirm(question, defaultValue);
  }

  async choice(question, choices, defaultChoice) {
    return this.prompts.choice(question, choices, defaultChoice);
  }

  async handle() {
    throw new Error(`Command [${this.name}] must implement handle().`);
  }
}

export default Command;
