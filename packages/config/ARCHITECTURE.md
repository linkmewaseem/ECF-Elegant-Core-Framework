# @ecfjs/config — Package Architecture

`@ecfjs/config` is the hierarchical configuration repository for the ECF ecosystem.

## Core Components

- **`ConfigRepository`**: Dot-notation config storage with merge and override support.
- **`EnvLoader`**: Maps environment variables to config keys.
- **`ConfigEncrypter`**: Encrypts and decrypts sensitive config values at rest.
- **`ConfigServiceProvider`**: Registers config bindings with the IoC container.

## Dependencies

- `@ecfjs/core`

## Dependency Rules

- MUST NOT depend on `@ecfjs/http`, `@ecfjs/database`, or transport-layer packages.
