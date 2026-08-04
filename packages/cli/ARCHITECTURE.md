# @ecf/cli — Package Architecture

`@ecf/cli` is the official command-line interface for the ECF ecosystem.

## Core Components

- **Command Registry**: Registers and dispatches CLI commands.
- **`ecf doctor`**: Validates Node version, workspace dependencies, and config integrity.
- **Scaffolding Commands**: Delegates to `@ecf/devkit` for AST-based code generation.

## Dependencies

- `@ecf/core`
- `@ecf/devkit`

## Dependency Rules

- CLI MUST NOT import internal package subpaths; only public `index.js` exports.
