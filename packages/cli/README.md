# `@ecfjs/cli` — Official ECF Command-Line Interface

> **Package:** `@ecfjs/cli` · **Version:** `1.0.0-rc.9` · **License:** MIT  
> **Node.js Requirement:** `>=22` · **Ecosystem:** Elegant Core Framework (ECF)

`@ecfjs/cli` is the official command-line interface for the ECF ecosystem. It provides project scaffolding, environment health diagnostics, code generation tools (`make:*`), and a zero-dependency CLI kernel inspired by Laravel Artisan.

---

## Table of Contents

- [Installation & Execution](#installation--execution)
- [Command Reference Guide](#command-reference-guide)
  - [1. Environment & Diagnostics Commands](#1-environment--diagnostics-commands)
  - [2. Project Scaffolding Commands](#2-project-scaffolding-commands)
  - [3. Code Generation (`make:*`) Commands](#3-code-generation-make-commands)
  - [4. Global Flags](#4-global-flags)
- [How to Use Scaffolding Commands](#how-to-use-scaffolding-commands)
- [Writing Custom Commands](#writing-custom-commands)
- [Programmatic API Usage](#programmatic-api-usage)
- [Documentation Links](#documentation-links)
- [License](#license)

---

## Installation & Execution

### 1. Global Installation
```bash
npm install -g @ecfjs/cli
ecf --help
```

### 2. Using via `npx` (No Install Needed)
```bash
npx @ecfjs/cli doctor
npx @ecfjs/cli new my-api-app --type=api
```

### 3. Monorepo / Local Project Dependency
```json
{
  "devDependencies": {
    "@ecfjs/cli": "^1.0.0-rc.7"
  }
}
```
Run via npm scripts:
```bash
npx ecf make:controller UserController --resource
```

---

## Command Reference Guide

Below is the complete table of all commands supported by `@ecfjs/cli`.

| Command | Signature | Description | Generated File / Action |
|---|---|---|---|
| **`doctor`** | `doctor` | Environment and health diagnostic checks | Terminal status report |
| **`new`** | `new {name} {--type=}` | Scaffold a new project from blueprint | `<name>/` directory |
| **`make:controller`** | `make:controller {name} {--resource} {--force}` | Generate an HTTP controller class | `app/Http/Controllers/<Name>Controller.js` |
| **`make:model`** | `make:model {name} {--force}` | Generate an ORM database model class | `app/Models/<Name>.js` |
| **`make:middleware`** | `make:middleware {name} {--force}` | Generate an HTTP pipeline middleware class | `app/Http/Middleware/<Name>Middleware.js` |
| **`make:request`** | `make:request {name} {--force}` | Generate a form request validation class | `app/Http/Requests/<Name>Request.js` |
| **`make:policy`** | `make:policy {name} {--force}` | Generate a resource authorization policy | `app/Policies/<Name>Policy.js` |
| **`make:command`** | `make:command {name} {--force}` | Generate a custom CLI command class | `app/Console/Commands/<Name>Command.js` |
| **`make:migration`** | `make:migration {name} {--force}` | Generate a database schema migration | `database/migrations/<timestamp>_<name>.js` |
| **`make:seeder`** | `make:seeder {name} {--force}` | Generate a database seed class | `database/seeders/<Name>Seeder.js` |
| **`make:job`** | `make:job {name} {--force}` | Generate a background queue job class | `app/Jobs/<Name>Job.js` |
| **`make:mail`** | `make:mail {name} {--force}` | Generate an email notification class | `app/Mail/<Name>Mail.js` |
| **`make:notification`**| `make:notification {name} {--force}` | Generate a multi-channel notification | `app/Notifications/<Name>Notification.js` |
| **`make:channel`** | `make:channel {name} {--force}` | Generate a broadcast channel authorization | `app/Broadcasting/<Name>Channel.js` |
| **`make:resource`** | `make:resource {name} {--force}` | Generate an API JSON resource transformer | `app/Http/Resources/<Name>Resource.js` |
| **`make:test`** | `make:test {name} {--force}` | Generate a unit or integration test file | `tests/Unit/<Name>Test.js` |

---

## Detailed Command Explanations & Examples

### 1. Environment & Diagnostics Commands

#### `ecf doctor`
Validates Node.js version requirements (`>= v22`), storage directory permissions, config file presence (`ecf.config.js`), and heap memory footprint.

```bash
ecf doctor
```

**Sample Output:**
```
┌──────────────────────────────────────────────────┐
│  ECF Framework Environment Diagnostic Tool        │
│  ecf doctor                                       │
└──────────────────────────────────────────────────┘

System Diagnostic Checks:
  ✔ Node.js Version          v22.5.0 (>= v22 required)
  ✔ Storage Permissions      Writable
  ✔ Application Config       Loaded
  ✔ Heap Memory Footprint    18.42 MB
```

---

### 2. Project Scaffolding Commands

#### `ecf new <name> [--type=api|ssr]`
Scaffolds a complete ECF web application from blueprint templates.

- **`--type=api`**: Scaffolds a JSON-only REST API project (JWT authentication, no view templates).
- **`--type=ssr`**: Scaffolds a server-side rendered web app (HTML views, session authentication).
- If `--type` is omitted, `ecf new` opens an interactive prompt to select the blueprint.

```bash
# Interactive mode
ecf new my-app

# Direct mode
ecf new my-api-server --type=api
ecf new my-web-portal --type=ssr
```

---

### 3. Code Generation (`make:*`) Commands

#### `ecf make:controller <name> [--resource] [--force]`
Scaffolds an HTTP Controller class.

```bash
# Basic controller
ecf make:controller UserController

# Resource controller (includes index, show, store, update, destroy methods)
ecf make:controller ProductController --resource
```

#### `ecf make:model <name> [--force]`
Scaffolds an ORM database Model class extending `@ecfjs/database`.

```bash
ecf make:model Post
```

#### `ecf make:middleware <name> [--force]`
Scaffolds an HTTP pipeline Middleware class with a `handle(request, next)` method.

```bash
ecf make:middleware AuthMiddleware
```

#### `ecf make:request <name> [--force]`
Scaffolds a Form Request validation class with a `rules()` method.

```bash
ecf make:request CreateUserRequest
```

#### `ecf make:policy <name> [--force]`
Scaffolds a Resource Policy class for access authorization.

```bash
ecf make:policy UserPolicy
```

#### `ecf make:command <name> [--force]`
Scaffolds a custom CLI Command class extending `Command`.

```bash
ecf make:command SyncProductsCommand
```

#### `ecf make:migration <name> [--force]`
Scaffolds a timestamped database migration script.

```bash
ecf make:migration create_orders_table
```

#### `ecf make:seeder <name> [--force]`
Scaffolds a database seeder script.

```bash
ecf make:seeder UserSeeder
```

#### `ecf make:job <name> [--force]`
Scaffolds a background queue job worker class.

```bash
ecf make:job ProcessPaymentJob
```

#### `ecf make:mail <name> [--force]`
Scaffolds an email notification class.

```bash
ecf make:mail WelcomeMail
```

#### `ecf make:notification <name> [--force]`
Scaffolds a multi-channel notification class (email, database, webhook).

```bash
ecf make:notification InvoicePaidNotification
```

#### `ecf make:channel <name> [--force]`
Scaffolds a real-time broadcast channel authorization class.

```bash
ecf make:channel OrderChannel
```

#### `ecf make:resource <name> [--force]`
Scaffolds an API JSON resource transformer class.

```bash
ecf make:resource UserResource
```

#### `ecf make:test <name> [--force]`
Scaffolds a unit/integration test file using `node:test`.

```bash
ecf make:test UserService
```

---

### 4. Global Flags

| Flag | Short | Description |
|---|---|---|
| `--help` | `-h` | Display application header and list of all available commands |
| `--version` | `-V` | Print current CLI framework name and version |

```bash
ecf --help
ecf --version
```

---

## Writing Custom Commands

You can create custom CLI commands in your ECF project by extending `Command`:

```js
// app/Console/Commands/GreetCommand.js
import { Command } from '@ecfjs/cli';

export class GreetCommand extends Command {
  constructor() {
    super();
    this.signature = 'greet {name=World} {--shout}';
    this.description = 'Print a friendly greeting';
  }

  async handle(input, output) {
    let name = input.argument('name');
    let message = `Hello, ${name}!`;

    if (input.option('shout')) {
      message = message.toUpperCase();
    }

    output.success(message);
  }
}
```

### Registering Your Command

```js
import { CliApplication } from '@ecfjs/cli';
import { GreetCommand } from './app/Console/Commands/GreetCommand.js';

const app = new CliApplication('My Custom CLI', '1.0.0');
app.register(GreetCommand);

app.run(process.argv.slice(2));
```

Run in shell:
```bash
node cli.js greet Alice --shout
# Output: ✔ HELLO, ALICE!
```

---

## Programmatic API Usage

You can also use generator modules programmatically inside your Node.js scripts:

```js
import { CodeGenerator, StubCompiler } from '@ecfjs/cli';

// Preview generated file content without writing to disk
const preview = CodeGenerator.generate(
  'controller',
  { name: 'Article', isResource: true },
  { dryRun: true }
);

console.log(preview.targetPath); // Target output path
console.log(preview.content);    // Rendered JS code
```

---

## Documentation Links

- [DOCS.md](./DOCS.md) — Complete single-file API documentation reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Package design & architecture guidelines

---

## License

MIT © Muhammad Waseem
