# @ecf/http — Package Architecture

`@ecf/http` is the high-performance HTTP transport layer for the ECF ecosystem.

## Core Components
- **`Router` & `TrieRouter`**: Radix Trie route matching engine for $O(K)$ path resolution.
- **`Request` & `NativeRequest`**: Express/Fastify compatible HTTP request wrapper.
- **`Response` & `AbstractResponse`**: Fluid HTTP response builder supporting JSON, HTML, streams, files, downloads, cookies, headers.
- **`HttpKernel`**: Request lifecycle orchestrator handling pipeline execution, route resolution, and error handling.
- **`MiddlewareRegistry` & `MiddlewareResolver`**: Global and per-route middleware stack resolution.
- **`HttpServer`**: Node `http.createServer` wrapper.

## Dependencies
- `@ecf/core`
- `@ecf/validation`
