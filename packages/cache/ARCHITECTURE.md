# @ecfjs/cache — Package Architecture

`@ecfjs/cache` is the multi-driver caching platform for the ECF ecosystem.

## Core Components

- **`CacheManager`**: Driver resolution and cache store orchestration.
- **`MemoryDriver` / `FileDriver` / `RedisDriver` / `NullDriver`**: Pluggable cache backends.
- **`CacheLock`**: Distributed lock primitive for cache stampede protection.
- **`TaggedCache`**: Tag-based cache grouping and bulk invalidation.
- **`CacheStampedeProtection`**: Probabilistic early expiration to prevent thundering herd.

## Dependencies

- `@ecfjs/core`

## Dependency Rules

- MUST NOT depend on `@ecfjs/http` or `@ecfjs/database`.
- Driver implementations MUST implement `ICacheDriver` contract.
