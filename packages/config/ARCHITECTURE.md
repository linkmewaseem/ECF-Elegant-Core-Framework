# @ecf/config — Package Architecture

`@ecf/config` is the hierarchical configuration repository for the ECF ecosystem.

## Core Components

- **`ConfigRepository`**: Dot-notation config storage with merge and override support.
- **`EnvLoader`**: Maps environment variables to config keys.
- **`ConfigEncrypter`**: Encrypts and decrypts sensitive config values at rest.
- **`ConfigServiceProvider`**: Registers config bindings with the IoC container.

## Dependencies

- `@ecf/core`

## Dependency Rules

- MUST NOT depend on `@ecf/http`, `@ecf/database`, or transport-layer packages.
