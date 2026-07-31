import { TrieNode } from './TrieNode.js';

/**
 * High-performance O(L) Trie-based Router Engine.
 */
export class TrieRouter {
  constructor() {
    this.root = new TrieNode();
    this.namedRoutes = new Map();
  }

  /**
   * Split path into non-empty segment parts.
   * @param {string} path
   * @returns {string[]}
   */
  static splitPath(path) {
    return path.split('/').filter(Boolean);
  }

  /**
   * Add route definition to the Trie.
   * @param {string|string[]} methods
   * @param {string} path
   * @param {any} handler
   * @param {object} [options]
   */
  addRoute(methods, path, handler, options = {}) {
    const methodList = Array.isArray(methods) ? methods : [methods];
    const parts = TrieRouter.splitPath(path);

    let curr = this.root;
    for (const part of parts) {
      curr = curr.addChild(part);
    }
    curr.isEnd = true;

    for (const m of methodList) {
      const upperMethod = m.toUpperCase();
      curr.handlers.set(upperMethod, {
        handler,
        middleware: options.middleware || [],
        name: options.name || null,
        path
      });

      if (options.name) {
        this.namedRoutes.set(options.name, { path, handler, method: upperMethod });
      }
    }
  }

  /**
   * Match HTTP method and path against the Trie tree.
   * @param {string} method
   * @param {string} path
   * @returns {{ route: object, params: object } | null}
   */
  match(method, path) {
    const upperMethod = method.toUpperCase();
    const parts = TrieRouter.splitPath(path);
    const params = {};

    const search = (node, index) => {
      if (index === parts.length) {
        if (node.isEnd && (node.handlers.has(upperMethod) || node.handlers.has('ANY'))) {
          const route = node.handlers.get(upperMethod) || node.handlers.get('ANY');
          return { route, params };
        }
        return null;
      }

      const part = parts[index];

      // 1. Exact static match
      if (node.children.has(part)) {
        const res = search(node.children.get(part), index + 1);
        if (res) return res;
      }

      // 2. Parametric match (:id or {slug})
      if (node.paramChild) {
        params[node.paramChild.paramName] = part;
        const res = search(node.paramChild, index + 1);
        if (res) return res;
        delete params[node.paramChild.paramName];
      }

      // 3. Wildcard match (*)
      if (node.wildcardChild) {
        params['*'] = parts.slice(index).join('/');
        if (node.wildcardChild.handlers.has(upperMethod) || node.wildcardChild.handlers.has('ANY')) {
          const route = node.wildcardChild.handlers.get(upperMethod) || node.wildcardChild.handlers.get('ANY');
          return { route, params };
        }
      }

      return null;
    };

    return search(this.root, 0);
  }

  /**
   * Lookup named route path.
   * @param {string} name
   * @returns {string|null}
   */
  getNamedRoute(name) {
    return this.namedRoutes.get(name)?.path || null;
  }
}
