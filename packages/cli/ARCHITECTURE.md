# @ecfjs/cli — Package Architecture

`@ecfjs/cli` is the official command-line interface for the ECF ecosystem.

## Core Components

- **Command Registry**: Registers and dispatches CLI commands.
- **`ecf doctor`**: Validates Node version, workspace dependencies, and config integrity.
- **Scaffolding Commands**: Delegates to `@ecfjs/devkit` for AST-based code generation.

## Dependencies

- `@ecfjs/core`
- `@ecfjs/devkit`

## Dependency Rules

- CLI MUST NOT import internal package subpaths; only public `index.js` exports.
