import { SignatureParser } from './SignatureParser.js';

/**
 * Base Command class for ECF CLI framework.
 */
export class Command {
  constructor() {
    this.signature = '';
    this.description = '';
  }

  getParsedSignature() {
    return SignatureParser.parse(this.signature);
  }

  async handle(input, output) {
    throw new Error(`Command [${this.constructor.name}] must implement handle().`);
  }
}
