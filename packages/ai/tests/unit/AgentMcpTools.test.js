import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ToolRegistry, AgentPlanner, McpManager, AiManager } from '../../src/index.js';

describe('AgentPlanner, ToolRegistry & MCP Unit Tests', () => {
  it('should register and execute tools', async () => {
    const tools = new ToolRegistry();
    tools.register('getWeather', {
      description: 'Get weather by city',
      execute: async ({ city }) => `Weather in ${city} is Sunny`,
    });

    const res = await tools.execute('getWeather', { city: 'Tokyo' });
    assert.strictEqual(res, 'Weather in Tokyo is Sunny');
  });

  it('should run autonomous agent planner', async () => {
    const ai = new AiManager();
    const agent = ai.agent();
    const result = await agent.run('Process user order #101');

    assert.ok(result.plan);
    assert.ok(result.reflection);
  });

  it('should connect to Model Context Protocol (MCP) servers', () => {
    const mcp = new McpManager();
    mcp.connect('github', { token: 'mock' });
    const server = mcp.getServer('github');

    assert.strictEqual(server.status, 'CONNECTED');
  });
});
