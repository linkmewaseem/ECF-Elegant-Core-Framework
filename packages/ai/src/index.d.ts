import { IAiManager, IAiDriver, IConversationMemory } from '@ecfjs/contracts';

export class AiManager extends IAiManager {
  driver(name?: string): IAiDriver;
  fake(): any;
  chat(prompt: string, options?: any): Promise<any>;
  stream(prompt: string, options?: any): AsyncIterable<string>;
  embed(text: string, options?: any): Promise<number[]>;
  memory(conversationId: string): IConversationMemory;
  registerPrompt(name: string, template: string, version?: string): this;
  prompt(nameWithVersion: string, variables?: any): string;
  agent(options?: any): any;
  rag(options?: any): any;
  mcp(serverName: string): any;
}

export const AI: AiManager;
export const AiFacade: AiManager;
export default AiFacade;
