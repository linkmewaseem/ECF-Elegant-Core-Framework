/**
 * Model Context Protocol (MCP) Abstraction Layer.
 */
export class McpManager {
  #servers = new Map();

  connect(serverName, config = {}) {
    this.#servers.set(serverName, { serverName, status: 'CONNECTED', config });
    return this;
  }

  getServer(serverName) {
    return this.#servers.get(serverName);
  }
}

export default McpManager;
