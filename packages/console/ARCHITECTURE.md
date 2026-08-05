# @ecfjs/console — Package Architecture

`@ecfjs/console` is the Artisan-style console command kernel for the ECF ecosystem.

## Core Components

- **`ConsoleKernel`**: Bootstraps and dispatches console commands.
- **`Command`**: Base class for defining CLI commands with signatures and handlers.
- **`CommandBus`**: Routes command execution with middleware support.
- **`SignatureParser`**: Parses command signatures into arguments and options.
- **`PromptsEngine`**: Interactive user input for CLI workflows.
- **`CommandAutoDiscoverer`**: Scans directories and registers command classes.

## Dependencies

- `@ecfjs/core`

## Dependency Rules

- Console commands MUST NOT start HTTP servers unless explicitly requested.
