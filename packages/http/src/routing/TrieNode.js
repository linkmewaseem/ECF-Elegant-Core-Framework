/**
 * Node in the Trie Router tree for high-performance path matching.
 */
export class TrieNode {
  constructor(part = '') {
    this.part = part;
    this.children = new Map();
    this.paramChild = null; // Node for :param or {param}
    this.wildcardChild = null; // Node for *
    this.paramName = null;
    this.handlers = new Map(); // HTTP method -> { handler, middleware, name }
    this.isEnd = false;
  }

  addChild(part) {
    if (part.startsWith(':') || (part.startsWith('{') && part.endsWith('}'))) {
      if (!this.paramChild) {
        const paramName = part.startsWith(':')
          ? part.slice(1)
          : part.slice(1, -1).split(':')[0]; // Handles {post:slug}
        this.paramChild = new TrieNode(part);
        this.paramChild.paramName = paramName;
      }
      return this.paramChild;
    }

    if (part === '*') {
      if (!this.wildcardChild) {
        this.wildcardChild = new TrieNode('*');
      }
      return this.wildcardChild;
    }

    if (!this.children.has(part)) {
      this.children.set(part, new TrieNode(part));
    }
    return this.children.get(part);
  }
}
