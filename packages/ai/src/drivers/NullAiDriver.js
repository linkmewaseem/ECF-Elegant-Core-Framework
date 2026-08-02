import { BaseAiDriver } from './BaseAiDriver.js';

export class NullAiDriver extends BaseAiDriver {
  async chat() { return { text: '', model: 'null', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } }; }
  async embed() { return []; }
}

export default NullAiDriver;
