# `@ecfjs/cli` — Complete Package Documentation

> **Package:** `@ecfjs/cli` · **Version:** `1.0.0-rc.9` · **License:** MIT  
> **Author:** Muhammad Waseem · **Node.js Requirement:** `>=22`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Package Structure](#2-package-structure)
3. [Installation & Setup](#3-installation--setup)
4. [Architecture & Design](#4-architecture--design)
5. [Kernel Layer](#5-kernel-layer)
   - 5.1 [SignatureParser](#51-signatureparser)
   - 5.2 [Input](#52-input)
   - 5.3 [Command](#53-command)
   - 5.4 [CommandRegistry](#54-commandregistry)
   - 5.5 [CliApplication](#55-cliapplication)
6. [Output Layer](#6-output-layer)
   - 6.1 [Output](#61-output)
   - 6.2 [Prompts](#62-prompts)
7. [Generators Layer](#7-generators-layer)
   - 7.1 [StubCompiler](#71-stubcompiler)
   - 7.2 [CodeGenerator](#72-codegenerator)
8. [Built-in Commands & Command Master List](#8-built-in-commands)
   - 8.1 [EcfDoctorCommand](#81-ecfdoctorcommand)
   - 8.2 [EcfNewCommand](#82-ecfnewcommand)
   - 8.3 [Complete ECF Ecosystem CLI Command Master List](#83-complete-ecf-ecosystem-cli-command-master-list)
9. [Plugin System](#9-plugin-system)
   - 9.1 [PluginDiscovery](#91-plugindiscovery)
10. [CLI Entry Point](#10-cli-entry-point)
11. [Public API (index.js Exports)](#11-public-api-indexjs-exports)
12. [Writing Custom Commands](#12-writing-custom-commands)
13. [Signature Syntax Reference](#13-signature-syntax-reference)
14. [Testing](#14-testing)
15. [Dependency Graph](#15-dependency-graph)
16. [Dependency Rules & Constraints](#16-dependency-rules--constraints)

---

## 1. Overview

`@ecfjs/cli` is the **official command-line interface** for the ECF (Elegant Core Framework) ecosystem. It provides:

- A **lightweight kernel** (no third-party CLI libraries) for registering and dispatching commands.
- A **Laravel-inspired signature syntax** for declarative command argument/option definitions.
- **Built-in scaffolding commands** (`ecf new`) to bootstrap new ECF projects from blueprint templates.
- **Environment diagnostics** (`ecf doctor`) to verify Node version, configuration, storage, and memory.
- A **code generation engine** (`CodeGenerator` + `StubCompiler`) to scaffold controllers, models, middleware, requests, and policies.
- An **interactive prompt system** (`Prompts`) built on top of Node.js `readline` with zero external dependencies.
- A **plugin discovery system** (`PluginDiscovery`) that auto-discovers installed and custom plugins via a `plugin.json` manifest.

The entire package is written in **ESM** (`"type": "module"`) and requires **Node.js >= 22**.

---

## 2. Package Structure

```
packages/cli/
├── bin/
│   └── ecf.js                   # CLI entry point (shebang #!/usr/bin/env node)
├── src/
│   ├── index.js                 # Public API barrel export
│   ├── kernel/
│   │   ├── SignatureParser.js   # Parses command signature strings
│   │   ├── Input.js             # Parsed CLI input abstraction
│   │   ├── Command.js           # Abstract base class for all commands
│   │   ├── CommandRegistry.js   # Registry for command lookup and dispatch
│   │   └── CliApplication.js   # Top-level application orchestrator
│   ├── output/
│   │   ├── Output.js            # ANSI-colored terminal output renderer
│   │   └── Prompts.js           # Interactive readline prompts (ask/confirm/select)
│   ├── generators/
│   │   ├── StubCompiler.js      # Mini template engine for stub files
│   │   └── CodeGenerator.js     # Generates code files from built-in stubs
│   ├── commands/
│   │   ├── EcfDoctorCommand.js  # `ecf doctor` — environment health checks
│   │   └── EcfNewCommand.js     # `ecf new <name>` — project scaffolding
│   └── plugins/
│       └── PluginDiscovery.js   # Auto-discovers plugin manifests
├── tests/
│   ├── SignatureParser.test.js
│   ├── GeneratorsAndStubs.test.js
│   └── EcfDoctor.test.js
├── package.json
├── ARCHITECTURE.md
├── README.md
└── DOCS.md                      ← (this file)
```

---

## 3. Installation & Setup

### As a Global CLI Tool

```bash
npm install -g @ecfjs/cli
ecf --help
```

### Via npx (No Installation Required)

```bash
npx @ecfjs/cli new my-app
npx @ecfjs/cli doctor
```

### Within a Monorepo Workspace

In the ECF monorepo this package is referenced via workspace links:

```json
"dependencies": {
  "@ecfjs/cli": "workspace:*"
}
```

The `bin` field in `package.json` exposes the `ecf` command:

```json
"bin": {
  "ecf": "./bin/ecf.js"
}
```

---

## 4. Architecture & Design

```
┌─────────────────────────────────────────────────────────────┐
│                         bin/ecf.js                          │
│              (Entry point — bootstraps CliApplication)       │
└────────────────────────────┬────────────────────────────────┘
                             │ creates
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      CliApplication                          │
│   - holds CommandRegistry                                    │
│   - holds Output                                             │
│   - dispatches `run(argv)` → parses args → calls handle()   │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌────────────────────┐      ┌─────────────────────────────────┐
│  CommandRegistry   │      │  Output (ANSI renderer)          │
│  - register()      │      │  - success / info / warning      │
│  - get(name)       │      │  - error / box / table / line    │
│  - all()           │      └─────────────────────────────────┘
└─────────┬──────────┘
          │ uses
          ▼
┌────────────────────┐
│  SignatureParser   │   ← parses "make:model {name} {--migration}"
└─────────┬──────────┘
          │ produces
          ▼
┌────────────────────┐      ┌─────────────────────────────────┐
│  Input             │      │  Command (abstract base class)   │
│  - argument(name)  │ ◄────│  - signature: string            │
│  - option(name)    │      │  - description: string          │
│  - hasOption(name) │      │  - handle(input, output)        │
└────────────────────┘      └─────────────────────────────────┘
                                         ▲ extends
                            ┌────────────┴────────────┐
                            │                         │
               ┌────────────────────┐   ┌─────────────────────────┐
               │  EcfDoctorCommand  │   │  EcfNewCommand          │
               │  signature: doctor │   │  signature: new {name}  │
               └────────────────────┘   └─────────────────────────┘

Generator Pipeline:
┌──────────────┐     compile()     ┌─────────────────────────────┐
│ StubCompiler │ ◄──────────────── │ CodeGenerator               │
│              │ ({{ vars }},      │ - generate(type, vars, opts) │
│              │  {{#if key}})     │ - writes file to disk        │
└──────────────┘                   └─────────────────────────────┘
```

**Design Principles:**
- **Zero external runtime dependencies** in the kernel (pure Node.js built-ins only).
- **Laravel-inspired signature DSL** for intuitive command definition.
- **Fluent builder API** — `app.register(Cmd).register(Cmd2)` chains cleanly.
- **Async-first** — every `handle()` method is `async`.
- **Exit-code contract** — `run()` returns `0` on success, `1` on error, and the entry point forwards this to `process.exitCode`.

---

## 5. Kernel Layer

The kernel is the core runtime engine. It lives in `src/kernel/` and contains no business logic.

---

### 5.1 SignatureParser

**File:** [`src/kernel/SignatureParser.js`](file:///f:/ecf/packages/cli/src/kernel/SignatureParser.js)

Parses **Laravel-style command signature strings** into a structured object containing the command name, positional arguments, and named options.

#### Class: `SignatureParser`

| Member | Type | Description |
|--------|------|-------------|
| `parse(signatureString)` | `static` method | Parses a signature string and returns a descriptor object. |

#### Method: `SignatureParser.parse(signatureString)`

```js
/**
 * @param {string} signatureString  A signature such as:
 *   "make:model {name} {--migration} {--factory} {--table=users}"
 *
 * @returns {{
 *   name: string,
 *   arguments: Array<{ name: string, isOptional: boolean, defaultValue: string|null }>,
 *   options:   Array<{ name: string, hasValue: boolean, defaultValue: string|false }>
 * }}
 */
static parse(signatureString)
```

**Parsing Rules:**

| Token Form | Parsed As | Notes |
|---|---|---|
| `command:name` | Command name | First whitespace-separated token |
| `{argName}` | Required argument | `isOptional: false`, `defaultValue: null` |
| `{argName?}` | Optional argument | `isOptional: true`, trailing `?` stripped |
| `{argName=default}` | Argument with default | `defaultValue` set to `"default"` |
| `{--flag}` | Boolean option | `hasValue: false`, `defaultValue: false` |
| `{--option=value}` | Option with default | `hasValue: true`, `defaultValue: "value"` |

**Throws:** `Error` if `signatureString` is empty or not a string.

**Examples:**

```js
import { SignatureParser } from '@ecfjs/cli';

// Simple command with arguments and options
const result = SignatureParser.parse('make:model {name} {--migration} {--table=users}');

// result =>
{
  name: 'make:model',
  arguments: [
    { name: 'name', isOptional: false, defaultValue: null }
  ],
  options: [
    { name: 'migration', hasValue: false, defaultValue: false },
    { name: 'table',     hasValue: true,  defaultValue: 'users' }
  ]
}

// Optional argument with default
SignatureParser.parse('greet {name=World}');
// => { name: 'greet', arguments: [{ name: 'name', isOptional: false, defaultValue: 'World' }], options: [] }

// Boolean flag only
SignatureParser.parse('migrate {--fresh} {--seed}');
// => { name: 'migrate', arguments: [], options: [{ name: 'fresh', ... }, { name: 'seed', ... }] }
```

---

### 5.2 Input

**File:** [`src/kernel/Input.js`](file:///f:/ecf/packages/cli/src/kernel/Input.js)

Wraps the parsed `argv` tokens into a clean, type-safe abstraction that commands use to access arguments and options.

#### Class: `Input`

```js
new Input(args = {}, options = {}, rawTokens = [])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `object` | Keyed map of positional argument values. |
| `options` | `object` | Keyed map of `--option` values. |
| `rawTokens` | `string[]` | The raw `argv` slice after the command name. |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `argument` | `argument(name, defaultValue = null) → string \| null` | Returns the named positional argument, or `defaultValue` if absent. |
| `option` | `option(name, defaultValue = false) → string \| boolean` | Returns the named option value, or `defaultValue` if absent. Boolean `true` when flag is passed without `=value`. |
| `hasOption` | `hasOption(name) → boolean` | Returns `true` if the option key is present in the parsed input. |

**Example in a command's `handle()` method:**

```js
async handle(input, output) {
  const name  = input.argument('name');           // positional arg
  const force = input.option('force');            // boolean flag
  const table = input.option('table', 'default_table'); // with default

  if (input.hasOption('dry-run')) {
    output.info('Dry run mode — nothing will be written.');
  }
}
```

---

### 5.3 Command

**File:** [`src/kernel/Command.js`](file:///f:/ecf/packages/cli/src/kernel/Command.js)

Abstract base class that every CLI command must extend.

#### Class: `Command`

| Member | Type | Description |
|--------|------|-------------|
| `signature` | `string` | Command signature string (must be set by subclass). |
| `description` | `string` | Human-readable description shown in help output. |
| `getParsedSignature()` | method | Calls `SignatureParser.parse(this.signature)` and returns the descriptor. |
| `handle(input, output)` | `async` method | **Must be overridden.** The command's execution body. Throws if not implemented. |

#### Extending `Command`

```js
import { Command } from '@ecfjs/cli';

export class GreetCommand extends Command {
  constructor() {
    super();
    this.signature   = 'greet {name=World} {--shout}';
    this.description = 'Greet a user by name';
  }

  async handle(input, output) {
    let greeting = `Hello, ${input.argument('name')}!`;
    if (input.option('shout')) greeting = greeting.toUpperCase();
    output.success(greeting);
  }
}
```

> **Important:** If `handle()` is not overridden, the base class throws:
> ```
> Error: Command [GreetCommand] must implement handle().
> ```

---

### 5.4 CommandRegistry

**File:** [`src/kernel/CommandRegistry.js`](file:///f:/ecf/packages/cli/src/kernel/CommandRegistry.js)

Maintains a `Map` of command names to their instances and parsed signatures.

#### Class: `CommandRegistry`

```js
new CommandRegistry()
```

#### Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `register` | `register(CommandClass) → this` | `CommandRegistry` | Accepts a class (constructor) or an already-instantiated object. Parses the signature and stores the entry. Returns `this` for chaining. |
| `get` | `get(name) → Entry \| null` | `{ CommandClass, instance, parsed }` or `null` | Retrieves a registered command entry by name. |
| `has` | `has(name) → boolean` | `boolean` | Returns `true` if the command name is registered. |
| `all` | `all() → Entry[]` | `Array<{ CommandClass, instance, parsed }>` | Returns all registered command entries. |

**Entry Shape:**

```ts
{
  CommandClass: Function,   // The original class reference
  instance: Command,        // An instantiated Command object
  parsed: {                 // Result of SignatureParser.parse()
    name: string,
    arguments: object[],
    options: object[]
  }
}
```

**Example:**

```js
import { CommandRegistry, GreetCommand, MigrateCommand } from '@ecfjs/cli';

const registry = new CommandRegistry();
registry
  .register(GreetCommand)
  .register(MigrateCommand);

const entry = registry.get('greet');
console.log(entry.parsed.name);     // 'greet'
console.log(entry.instance.description);
```

---

### 5.5 CliApplication

**File:** [`src/kernel/CliApplication.js`](file:///f:/ecf/packages/cli/src/kernel/CliApplication.js)

The top-level orchestrator. It owns a `CommandRegistry` and an `Output` instance, handles global flags (`--help`, `--version`), dispatches commands, and manages exit codes.

#### Class: `CliApplication`

```js
new CliApplication(name = 'ECF CLI Framework', version = '1.0.0-alpha.1')
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Application display name shown in help boxes and version output. |
| `version` | `string` | Version string shown with `--version` / `-V`. |

#### Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `register` | `register(CommandClass) → this` | `CliApplication` | Registers a command class into the internal `CommandRegistry`. Fluent (chainable). |
| `run` | `async run(argv?) → number` | `Promise<0 \| 1>` | Parses `argv`, dispatches the matched command, and returns an exit code. |
| `renderHelp` | `renderHelp() → void` | `void` | Prints the application banner and the list of available commands. |

#### `run(argv)` Dispatch Logic

```
argv is empty
  OR contains --help / -h      → renderHelp()          → return 0

argv contains --version / -V   → print name + version → return 0

argv[0] does not match any
registered command             → output.error(...)
                                 renderHelp()           → return 1

Command matched                → parse args & options
                                 build Input object
                                 await instance.handle(input, output)
                                 on success              → return 0
                                 on thrown Error         → output.error → return 1
```

#### Argument Parsing Algorithm

`CliApplication.run()` loops over `rawArgs` (everything after the command name):

- Tokens that **start with `--`** are parsed as options. If the token contains `=`, the right-hand side is the value; otherwise the value is `true` (boolean flag).
- Remaining tokens are mapped **positionally** to the argument list from the parsed signature.
- Arguments not supplied by the user receive their `defaultValue` from the signature.

**Example:**

```
ecf make:model Post --migration --table=posts
        ↓
rawArgs = ['Post', '--migration', '--table=posts']

args    = { name: 'Post' }
options = { migration: true, table: 'posts' }
```

#### Full Bootstrap Example

```js
import { CliApplication } from '@ecfjs/cli';
import { EcfDoctorCommand } from '@ecfjs/cli';
import { GreetCommand } from './commands/GreetCommand.js';

const app = new CliApplication('My App CLI', '2.0.0');
app
  .register(EcfDoctorCommand)
  .register(GreetCommand);

const code = await app.run(process.argv.slice(2));
process.exitCode = code;
```

---

## 6. Output Layer

The output layer lives in `src/output/` and provides formatted terminal rendering and interactive prompts.

---

### 6.1 Output

**File:** [`src/output/Output.js`](file:///f:/ecf/packages/cli/src/output/Output.js)

ANSI-colored, rich console formatting output renderer. By default writes to `process.stdout`, but accepts any writable stream in the constructor (useful for testing).

#### Class: `Output`

```js
new Output(stream = process.stdout)
```

#### Methods

| Method | Signature | ANSI Color | Icon | Description |
|--------|-----------|-----------|------|-------------|
| `write` | `write(text) → void` | — | — | Write raw text without a trailing newline. |
| `line` | `line(text = '') → void` | — | — | Write a line of text with a trailing `\n`. |
| `success` | `success(message) → void` | Green `\x1b[32m` | `✔` | Print a green success message. |
| `info` | `info(message) → void` | Cyan `\x1b[36m` | `ℹ` | Print a cyan informational message. |
| `warning` | `warning(message) → void` | Yellow `\x1b[33m` | `⚠` | Print a yellow warning message. |
| `error` | `error(message) → void` | Red `\x1b[31m` | `✖` | Print a red error message. |
| `box` | `box(title, message) → void` | Blue `\x1b[34m` | — | Print a decorative bordered box with a bold title and message. |
| `table` | `table(headers, rows) → void` | Bold headers | — | Print a simple `|`-separated table with headers and rows. |

#### Visual Output Reference

```
output.success('File created!');
  → ✔ File created!           (green)

output.info('Processing...');
  → ℹ Processing...           (cyan)

output.warning('File exists');
  → ⚠ File exists             (yellow)

output.error('Command failed');
  → ✖ Command failed          (red)

output.box('ECF CLI', 'Version: 1.0.0');
  → ┌──────────────────────┐  (blue)
    │  ECF CLI              │
    │  Version: 1.0.0       │
    └──────────────────────┘

output.table(
  ['Name', 'Status'],
  [['User', 'Active'], ['Admin', 'Disabled']]
);
  → Name | Status             (bold)
    ------------
    User | Active
    Admin | Disabled
```

#### Testing with a Mock Stream

```js
const sink = { write: () => {} };    // discard all output
const output = new Output(sink);
await myCommand.handle(input, output);
```

---

### 6.2 Prompts

**File:** [`src/output/Prompts.js`](file:///f:/ecf/packages/cli/src/output/Prompts.js)

Reusable interactive CLI prompts built on Node.js `readline`. All methods are **static** and **async**.

#### Class: `Prompts`

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `ask` | `static async ask(question, defaultValue = '') → string` | `Promise<string>` | Display a text prompt. Returns the trimmed answer, or `defaultValue` if the user presses Enter without typing. |
| `confirm` | `static async confirm(question, defaultValue = true) → boolean` | `Promise<boolean>` | Display a `[Y/n]` or `[y/N]` prompt. Returns `true` if the answer starts with `y` (case-insensitive), `false` otherwise. |
| `select` | `static async select(question, choices, defaultIndex = 0) → string` | `Promise<string>` | Display a numbered list of choices. Returns the selected string, or the default choice on invalid input. |

#### `ask` Example

```js
import { Prompts } from '@ecfjs/cli';

const name = await Prompts.ask('Enter project name', 'my-app');
// Prompt:  Enter project name [my-app]:
// → returns trimmed user input, or 'my-app' if Enter pressed
```

#### `confirm` Example

```js
const proceed = await Prompts.confirm('Overwrite existing file?', false);
// Prompt:  Overwrite existing file? [y/N]:
// → returns false if Enter pressed (matches defaultValue)
// → returns true if user types 'y' or 'yes'
// → returns false if user types 'n' or anything else
```

#### `select` Example

```js
const blueprint = await Prompts.select(
  'Which blueprint would you like to use?',
  ['api  — JSON-only API', 'ssr  — Server-rendered app'],
  0   // default is first option (*)
);
// Output:
// ? Which blueprint would you like to use?
//   * 1) api  — JSON-only API
//     2) ssr  — Server-rendered app
// Select option (1-2) [1]:
```

---

## 7. Generators Layer

The generators layer lives in `src/generators/` and provides a mini template engine and a file-generation system.

---

### 7.1 StubCompiler

**File:** [`src/generators/StubCompiler.js`](file:///f:/ecf/packages/cli/src/generators/StubCompiler.js)

A minimal two-pass template compiler that supports **variable interpolation** and **conditional blocks**. All methods are **static**.

#### Class: `StubCompiler`

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `compile` | `static compile(stubContent, variables = {}) → string` | `string` | Compiles a stub string with the given variables and returns the rendered output. |

#### Template Syntax

**Variable Interpolation:** `{{ variableName }}`

```
{{ className }} → replaced with the value of variables.className
```

- Surrounding whitespace inside `{{ }}` is ignored.
- If the variable key does not exist in `variables`, the original `{{ key }}` placeholder is left unchanged.

**Conditional Blocks:** `{{#if key}}...{{/if}}`

```
{{#if isResource}}
  async index(req, res) { return res.json([]); }
{{/if}}
```

- The block is included only if `Boolean(variables[key])` is truthy.
- Blocks can span multiple lines (the regex is `[\s\S]*?` — non-greedy dotall).
- **No nested conditionals** are supported.

#### Examples

```js
import { StubCompiler } from '@ecfjs/cli';

// Basic variable replacement
StubCompiler.compile('Hello, {{ name }}!', { name: 'World' });
// → 'Hello, World!'

// Conditional block — truthy
StubCompiler.compile(
  'class {{ class }} { {{#if isResource}}async index() {}{{/if}} }',
  { class: 'PostController', isResource: true }
);
// → 'class PostController { async index() {} }'

// Conditional block — falsy (block removed)
StubCompiler.compile(
  'class {{ class }} { {{#if isResource}}async index() {}{{/if}} }',
  { class: 'PostController', isResource: false }
);
// → 'class PostController {  }'

// Unknown variable left as-is
StubCompiler.compile('Hello {{ unknown }}!', {});
// → 'Hello {{ unknown }}!'
```

---

### 7.2 CodeGenerator

**File:** [`src/generators/CodeGenerator.js`](file:///f:/ecf/packages/cli/src/generators/CodeGenerator.js)

Generates code files from built-in stub templates. Automatically creates directories, handles dry-run and force-overwrite modes. All methods are **static**.

#### Class: `CodeGenerator`

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `generate` | `static generate(targetType, variables, options?) → Result` | `Result` | Generate a code file of the given type. |

#### `generate(targetType, variables, options?)`

```js
/**
 * @param {string} targetType
 *   One of: 'controller' | 'model' | 'middleware' | 'request' | 'policy'
 *   Any other value generates a generic class file under `app/`.
 *
 * @param {object} variables
 *   { name: string, isResource?: boolean, ...any custom vars }
 *   `name` is required. `class` and `className` are auto-derived (PascalCase).
 *
 * @param {object} [options]
 *   { dryRun?: boolean, force?: boolean, basePath?: string }
 *
 * @returns {{ targetPath: string, content: string, written: boolean }}
 */
static generate(targetType, variables, options = {})
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | `boolean` | `false` | When `true`, return the result without writing to disk. `written` will be `false`. |
| `force` | `boolean` | `false` | When `true`, overwrite an existing file. When `false` and the file exists, an `Error` is thrown. |
| `basePath` | `string` | `process.cwd()` | The base directory to resolve the relative path against. |

#### Generated File Paths

| `targetType` | Relative Output Path |
|---|---|
| `controller` | `app/Http/Controllers/{ClassName}Controller.js` |
| `model` | `app/Models/{ClassName}.js` |
| `middleware` | `app/Http/Middleware/{ClassName}.js` |
| `request` | `app/Http/Requests/{ClassName}Request.js` |
| `policy` | `app/Policies/{ClassName}Policy.js` |
| _(anything else)_ | `app/{ClassName}.js` |

#### Return Value

```ts
{
  targetPath: string,   // Absolute path of the output file
  content: string,      // Rendered file content (always present, even in dryRun)
  written: boolean      // true if written to disk, false in dryRun mode
}
```

#### Error Conditions

| Condition | Error |
|---|---|
| File already exists and `force: false` | `Error: File already exists at <path>. Use --force to overwrite.` |

#### Examples

```js
import { CodeGenerator } from '@ecfjs/cli';

// 1. Generate a resource controller (dry-run)
const result = CodeGenerator.generate(
  'controller',
  { name: 'Post', isResource: true },
  { dryRun: true }
);
console.log(result.written);    // false
console.log(result.targetPath); // /path/to/cwd/app/Http/Controllers/PostController.js
console.log(result.content);    // export class PostController extends Controller { ... }

// 2. Actually write a model file
const { targetPath, written } = CodeGenerator.generate(
  'model',
  { name: 'product' }
  // options defaults: { dryRun: false, force: false, basePath: process.cwd() }
);
// → writes app/Models/Product.js
// → creates intermediate directories automatically

// 3. Force-overwrite an existing middleware
CodeGenerator.generate(
  'middleware',
  { name: 'Auth' },
  { force: true }
);

// 4. Generate with custom base path
CodeGenerator.generate(
  'request',
  { name: 'CreateUser' },
  { basePath: '/srv/my-ecf-app' }
);
// → writes /srv/my-ecf-app/app/Http/Requests/CreateUserRequest.js
```

#### Generated Stub Templates

<details>
<summary><strong>controller</strong></summary>

```js
import { Controller } from './Controller.js';

export class PostController extends Controller {
  async index(req, res) { return res.json([]); }      // only when isResource: true
  async show(req, res) { return res.json({}); }
  async store(req, res) { return res.json({ status: 'created' }); }
  async update(req, res) { return res.json({ status: 'updated' }); }
  async destroy(req, res) { return res.json({ status: 'deleted' }); }
}

export default PostController;
```

</details>

<details>
<summary><strong>model</strong></summary>

```js
import { Model } from '../../database/src/index.js';

export class Product extends Model {
  static table = 'products';
  static primaryKey = 'id';
}

export default Product;
```

</details>

<details>
<summary><strong>middleware</strong></summary>

```js
export class Auth {
  async handle(request, next) {
    return next(request);
  }
}

export default Auth;
```

</details>

<details>
<summary><strong>request</strong></summary>

```js
import { FormRequest } from '../../../../http/src/index.js';

export class CreateUserRequest extends FormRequest {
  rules() {
    return {
      // Validation rules
    };
  }
}

export default CreateUserRequest;
```

</details>

<details>
<summary><strong>policy</strong></summary>

```js
import { Policy } from '../../../http/src/index.js';

export class UserPolicy extends Policy {
  async view(user, resource) {
    return true;
  }
}

export default UserPolicy;
```

</details>

---

## 8. Built-in Commands

---

### 8.1 EcfDoctorCommand

**File:** [`src/commands/EcfDoctorCommand.js`](file:///f:/ecf/packages/cli/src/commands/EcfDoctorCommand.js)  
**Signature:** `doctor`  
**Description:** _Run diagnostic health checks across application environment and dependencies_

#### Usage

```bash
ecf doctor
```

#### What It Checks

| Check | Pass Condition | Symbol |
|---|---|---|
| **Node.js Version** | `process.version` major >= 22 | ✔ (green) or ✖ (red) |
| **Storage Permissions** | `storage/` or `storage/logs` directory exists in CWD | ✔ (green) or ⚠ (yellow) |
| **Application Config** | `ecf.config.js` or `config/app.js` exists in CWD | ✔ (green) or ℹ (cyan) |
| **Heap Memory Footprint** | Always reported | ✔ (green) with MB value |

#### Sample Output

```
┌──────────────────────────────────────────────────┐
│  ECF Framework Environment Diagnostic Tool        │
│  ecf doctor                                       │
└──────────────────────────────────────────────────┘

System Diagnostic Checks:
  ✔ Node.js Version          v22.5.0 (>= v22 required)
  ✔ Storage Permissions      Writable
  ℹ Application Config       No ecf.config.js detected in current CWD
  ✔ Heap Memory Footprint    18.42 MB
```

#### Return Value

`handle()` returns an array of check result objects — this is primarily used for testing:

```ts
Array<{ item: string, status: '✔' | '⚠' | 'ℹ' | '✖', detail: string }>
```

---

### 8.2 EcfNewCommand

**File:** [`src/commands/EcfNewCommand.js`](file:///f:/ecf/packages/cli/src/commands/EcfNewCommand.js)  
**Signature:** `new {name} {--type=}`  
**Description:** _Scaffold a new ECF application from a blueprint template_

#### Usage

```bash
# Interactive blueprint selection
ecf new my-app

# Non-interactive with explicit blueprint type
ecf new my-api --type=api
ecf new my-site --type=ssr
```

#### Arguments & Options

| Parameter | Kind | Required | Description |
|---|---|---|---|
| `name` | positional argument | **Yes** | The project directory name to create. |
| `--type` | option | No | Blueprint type: `api` or `ssr`. If omitted, an interactive `Prompts.select()` is shown. |

#### Blueprint Types

| Type | Description |
|---|---|
| `api` | JSON-only API — JWT auth, no views |
| `ssr` | Server-rendered app — HTML views, session auth |

#### What It Does (Step by Step)

1. **Validate `name`** — exits with an error if not provided.
2. **Select blueprint** — uses `--type` option or falls back to `Prompts.select()`.
3. **Resolve skeleton path** — calls `require.resolve('@ecfjs/skeleton/package.json')` to locate the skeleton blueprint directory at `@ecfjs/skeleton/v1/<type>/`.
4. **Check for conflicts** — errors if the target directory `<cwd>/<name>` already exists.
5. **Copy blueprint** — recursively copies the blueprint directory, skipping `node_modules` and `.git`.
6. **Rewrite `package.json`** — sets `name` to the project name and `private: true`.
7. **Rewrite `ecf.config.js`** — updates the `name:` field to the project name.
8. **Print next steps** — displays the 4-step onboarding instructions.

#### Sample Output

```
  Scaffolding new ECF API project…

✔ Blueprint copied   → my-api
✔ package.json       → name set to "my-api"
✔ ecf.config.js      → name set to "my-api"

┌──────────────────────────────────────────────────┐
│  ✔ Project "my-api" created successfully!         │
└──────────────────────────────────────────────────┘

Next steps:
  1.  cd my-api
  2.  npm install
  3.  cp .env.example .env   # then fill in your DB credentials
  4.  npm run dev
```

#### Error Cases

| Condition | Error Message |
|---|---|
| `name` argument missing | `Project name is required. Usage: ecf new <name>` |
| `@ecfjs/skeleton` not installed | `Could not locate @ecfjs/skeleton. Make sure it is installed.` |
| Blueprint type path not found | `Blueprint "<type>" not found at <path>.` |
| Target directory already exists | `Directory "<name>" already exists. Choose a different name or remove it first.` |

#### Internal Helper: `copyDir(src, dest)`

A private recursive directory copy function used by `EcfNewCommand`. It:
- Creates the destination directory with `fs.mkdirSync(dest, { recursive: true })`.
- Skips `node_modules` and `.git` directories.
- Recursively copies subdirectories.
- Copies files with `fs.copyFileSync`.

---

### 8.3 Complete ECF Ecosystem CLI Command Master List

The following master table lists all CLI commands supported across the ECF framework tooling (built-in commands, generators, migrations, and scheduler operations).

#### 1. System & Project Management Commands

| Command | Signature | Description | Example Usage |
|---|---|---|---|
| **Environment Doctor** | `doctor` | Runs health diagnostics on Node.js version, storage permissions, and config. | `ecf doctor` |
| **New Project** | `new {name} {--type=}` | Scaffolds a new project from a blueprint template (`api` or `ssr`). | `ecf new my-api --type=api` |
| **Help & Banner** | `--help` / `-h` | Renders application header box and lists all registered commands. | `ecf --help` |
| **Version Info** | `--version` / `-V` | Displays current CLI framework name and semantic version. | `ecf --version` |

#### 2. Code Generator (`make:*`) Commands

| Command | Signature | Description | Target Generated File |
|---|---|---|---|
| **Make Controller** | `make:controller {name} {--resource}` | Scaffold HTTP controller class (with index/show/store/update/destroy if `--resource`). | `app/Http/Controllers/UserController.js` |
| **Make Model** | `make:model {name}` | Scaffold ORM database model class extending base `Model`. | `app/Models/User.js` |
| **Make Middleware** | `make:middleware {name}` | Scaffold HTTP pipeline middleware class with `handle(request, next)`. | `app/Http/Middleware/AuthMiddleware.js` |
| **Make Request** | `make:request {name}` | Scaffold form request validation class extending `FormRequest`. | `app/Http/Requests/CreateUserRequest.js` |
| **Make Policy** | `make:policy {name}` | Scaffold resource authorization policy class extending `Policy`. | `app/Policies/UserPolicy.js` |
| **Make Command** | `make:command {name}` | Scaffold custom CLI command extending `Command`. | `app/Console/Commands/CustomCommand.js` |
| **Make Migration** | `make:migration {name}` | Scaffold database table schema migration script. | `database/migrations/001_create_users_table.js` |
| **Make Seeder** | `make:seeder {name}` | Scaffold database seed class for population. | `database/seeders/UserSeeder.js` |
| **Make Event** | `make:event {name}` | Scaffold application domain event class. | `app/Events/OrderPlacedEvent.js` |
| **Make Listener** | `make:listener {name}` | Scaffold asynchronous event listener class. | `app/Listeners/SendOrderEmailListener.js` |
| **Make Job** | `make:job {name}` | Scaffold background queue job worker class. | `app/Jobs/ProcessPaymentJob.js` |
| **Make Mail** | `make:mail {name}` | Scaffold email notification class. | `app/Mail/WelcomeMail.js` |
| **Make Notification** | `make:notification {name}` | Scaffold multi-channel notification (Email/Database/Webhook). | `app/Notifications/InvoicePaidNotification.js` |
| **Make Channel** | `make:channel {name}` | Scaffold real-time broadcast channel authorization class. | `app/Broadcasting/OrderChannel.js` |
| **Make Resource** | `make:resource {name}` | Scaffold API JSON resource transformer class. | `app/Http/Resources/UserResource.js` |
| **Make Test** | `make:test {name}` | Scaffold unit or integration test file. | `tests/Unit/UserService.test.js` |

#### 3. Database & Migration Commands

| Command | Signature | Description | Example Usage |
|---|---|---|---|
| **Run Migrations** | `migrate` | Executes all pending database schema migrations. | `ecf migrate` |
| **Rollback Migration** | `migrate:rollback` | Rollbacks the last batch of executed migrations. | `ecf migrate:rollback` |
| **Fresh Database** | `migrate:fresh` | Drops all tables and re-runs all migrations from scratch. | `ecf migrate:fresh` |
| **Seed Database** | `db:seed` | Runs seeders to populate initial database records. | `ecf db:seed` |

#### 4. Task Scheduler (`schedule:*`) Commands

| Command | Signature | Description | Example Usage |
|---|---|---|---|
| **Run Schedule** | `schedule:run` | Evaluates and executes due scheduled tasks (cron worker loop). | `ecf schedule:run` |
| **List Schedule** | `schedule:list` | Lists all registered scheduled tasks, cron expressions, and next run times. | `ecf schedule:list` |
| **Test Schedule** | `schedule:test` | Dry-runs a specific scheduled task without mutating state. | `ecf schedule:test` |
| **Clear Schedule Cache** | `schedule:clear-cache` | Clears schedule execution cache and mutex locks. | `ecf schedule:clear-cache` |


---

## 9. Plugin System

---

### 9.1 PluginDiscovery

**File:** [`src/plugins/PluginDiscovery.js`](file:///f:/ecf/packages/cli/src/plugins/PluginDiscovery.js)

Discovers installed and custom plugins by scanning two directories for `plugin.json` manifest files.

#### Class: `PluginDiscovery`

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `discoverAndRegister` | `static async discoverAndRegister(registry, basePath?) → DiscoveredPlugin[]` | `Promise<DiscoveredPlugin[]>` | Scan plugin directories, parse manifests, and return discovered plugins. |

#### `discoverAndRegister(registry, basePath?)`

```js
/**
 * @param {CommandRegistry} registry  The registry to register commands into (future use).
 * @param {string} [basePath]         Base directory to scan. Defaults to process.cwd().
 * @returns {Promise<DiscoveredPlugin[]>}
 */
static async discoverAndRegister(registry, basePath = process.cwd())
```

#### Scanned Directories

| Directory | Purpose |
|---|---|
| `<basePath>/plugins/installed/` | Plugins installed via package manager |
| `<basePath>/plugins/custom/` | User-authored local plugins |

#### Discovery Algorithm

1. For each of the two plugin directories, if it exists:
2. Read all entries with `fs.readdirSync`.
3. For each **subdirectory** entry, look for `<pluginDir>/<entryName>/plugin.json`.
4. If the manifest file exists, parse it as JSON.
5. On parse error, the plugin is silently skipped.
6. Append `{ name, path, manifest }` to the results.

#### `DiscoveredPlugin` Shape

```ts
{
  name: string,         // Directory name of the plugin
  path: string,         // Absolute path to the plugin directory
  manifest: object      // Parsed plugin.json content
}
```

#### `plugin.json` Manifest (Recommended Structure)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Adds extra ECF commands",
  "commands": ["./src/commands/MyCommand.js"]
}
```

> **Note:** The current `PluginDiscovery` implementation returns discovered plugins but does not yet dynamically import or register their commands. Command registration from manifests is intended for a future version.

#### Example Usage

```js
import { CliApplication, PluginDiscovery, CommandRegistry } from '@ecfjs/cli';

const app = new CliApplication('My App', '1.0.0');

// Discover plugins before running
const plugins = await PluginDiscovery.discoverAndRegister(app.registry);
console.log(`Discovered ${plugins.length} plugins`);

await app.run(process.argv.slice(2));
```

---

## 10. CLI Entry Point

**File:** [`bin/ecf.js`](file:///f:/ecf/packages/cli/bin/ecf.js)

The shebang-enabled Node.js entry point that bootstraps the `CliApplication` with the two built-in commands.

```js
#!/usr/bin/env node

import { CliApplication } from '../src/kernel/CliApplication.js';
import { EcfDoctorCommand } from '../src/commands/EcfDoctorCommand.js';
import { EcfNewCommand } from '../src/commands/EcfNewCommand.js';

const app = new CliApplication('ECF Enterprise CLI Framework', '1.0.0-alpha.1');
app.register(EcfDoctorCommand);
app.register(EcfNewCommand);

app.run(process.argv.slice(2)).then((code) => {
  if (code !== 0) {
    process.exitCode = code;
  }
});
```

**Key Points:**
- `process.argv.slice(2)` strips `node` and the script path, leaving only user-provided tokens.
- Non-zero exit codes are forwarded to `process.exitCode` (not `process.exit()`, so async cleanup can still run).
- The app name and version shown in the banner (`'ECF Enterprise CLI Framework'`, `'1.0.0-alpha.1'`) are **hardcoded** in the entry point, separate from the `package.json` version.

---

## 11. Public API (index.js Exports)

**File:** [`src/index.js`](file:///f:/ecf/packages/cli/src/index.js)

All public classes are re-exported from the barrel file:

```js
export { SignatureParser }    from './kernel/SignatureParser.js';
export { Input }              from './kernel/Input.js';
export { Command }            from './kernel/Command.js';
export { CommandRegistry }    from './kernel/CommandRegistry.js';
export { CliApplication }     from './kernel/CliApplication.js';
export { Output }             from './output/Output.js';
export { Prompts }            from './output/Prompts.js';
export { StubCompiler }       from './generators/StubCompiler.js';
export { CodeGenerator }      from './generators/CodeGenerator.js';
export { EcfDoctorCommand }   from './commands/EcfDoctorCommand.js';
export { EcfNewCommand }      from './commands/EcfNewCommand.js';
export { PluginDiscovery }    from './plugins/PluginDiscovery.js';
```

**Import from the package root:**

```js
import {
  CliApplication,
  Command,
  Output,
  Prompts,
  CodeGenerator,
  StubCompiler,
  SignatureParser,
  Input,
  CommandRegistry,
  PluginDiscovery,
  EcfDoctorCommand,
  EcfNewCommand
} from '@ecfjs/cli';
```

---

## 12. Writing Custom Commands

### Minimal Example

```js
import { Command } from '@ecfjs/cli';

export class HelloCommand extends Command {
  constructor() {
    super();
    this.signature   = 'hello {name=World} {--shout}';
    this.description = 'Print a greeting';
  }

  async handle(input, output) {
    let msg = `Hello, ${input.argument('name')}!`;
    if (input.option('shout')) msg = msg.toUpperCase();
    output.success(msg);
  }
}
```

```bash
ecf hello              # → ✔ Hello, World!
ecf hello Alice        # → ✔ Hello, Alice!
ecf hello Alice --shout # → ✔ HELLO, ALICE!
```

### Command with Prompts and Code Generation

```js
import { Command, Prompts, CodeGenerator, Output } from '@ecfjs/cli';

export class MakeServiceCommand extends Command {
  constructor() {
    super();
    this.signature   = 'make:service {name}';
    this.description = 'Generate a new service class';
  }

  async handle(input, output) {
    const name = input.argument('name');
    if (!name) {
      output.error('Service name is required.');
      return;
    }

    const confirmed = await Prompts.confirm(`Create service "${name}"?`, true);
    if (!confirmed) {
      output.warning('Aborted.');
      return;
    }

    const { targetPath, written } = CodeGenerator.generate('service', { name });
    if (written) {
      output.success(`Service created at ${targetPath}`);
    }
  }
}
```

### Registering Custom Commands

```js
// bootstrap.js (or your own entry point)
import { CliApplication } from '@ecfjs/cli';
import { MakeServiceCommand } from './commands/MakeServiceCommand.js';

const app = new CliApplication('My App CLI', '1.0.0');
app.register(MakeServiceCommand);
app.run(process.argv.slice(2));
```

### Programmatic Use (No CLI)

You can use individual classes without the full CLI runtime:

```js
import { CodeGenerator } from '@ecfjs/cli';

// Programmatic code generation in a build script
const { targetPath, content } = CodeGenerator.generate(
  'model',
  { name: 'invoice' },
  { dryRun: true }
);
console.log(content);
```

---

## 13. Signature Syntax Reference

| Syntax | Meaning | Accessible via |
|---|---|---|
| `command:name` | Command name | `SignatureParser.parse().name` |
| `{arg}` | Required positional argument | `input.argument('arg')` |
| `{arg?}` | Optional positional argument | `input.argument('arg')` — returns `null` if absent |
| `{arg=default}` | Argument with default value | `input.argument('arg')` — returns `'default'` if absent |
| `{--flag}` | Boolean flag | `input.option('flag')` — returns `true` or `false` |
| `{--option=}` | Option accepting a value (no default) | `input.option('option')` — returns value or `false` |
| `{--option=default}` | Option with a default value | `input.option('option')` — returns value or `'default'` |

**Full signature example:**

```
make:model {name} {--migration} {--factory} {--seed} {--table=model_table} {--force}
```

**Usage examples:**

```bash
ecf make:model User --migration --table=users --force
#   input.argument('name')       → 'User'
#   input.option('migration')    → true
#   input.option('factory')      → false
#   input.option('table')        → 'users'
#   input.option('force')        → true
```

---

## 14. Testing

Tests use Node.js's built-in `node:test` runner with `node:assert/strict`.

### Running Tests

```bash
cd packages/cli
node --test
```

### Test Files

#### `tests/SignatureParser.test.js`

Tests the `SignatureParser` with a complex signature containing arguments and options with and without default values.

```
✔ Milestone 12 - SignatureParser parses command name, arguments, and options
  - parsed.name === 'make:model'
  - arguments.length === 1, arguments[0].name === 'name'
  - options.length === 3
  - options[2].hasValue === true, options[2].defaultValue === 'users'
```

#### `tests/GeneratorsAndStubs.test.js`

Tests `StubCompiler` variable compilation and conditional blocks, and `CodeGenerator` dry-run mode.

```
✔ Milestone 12 - StubCompiler compiles variables and conditionals
✔ Milestone 12 - CodeGenerator dry-run preview generates valid code
  - result.written === false
  - result.targetPath ends with 'PostController.js'
  - result.content matches 'export class PostController extends Controller'
  - result.content matches 'async index(req, res)'
```

#### `tests/EcfDoctor.test.js`

Tests the `EcfDoctorCommand` end-to-end with a mocked `Output` stream.

```
✔ Milestone 12 - EcfDoctorCommand executes environment health diagnostic checks
  - checks is an Array
  - checks.length >= 3
  - checks[0].item === 'Node.js Version'
  - checks[0].status === '✔'
```

### Writing Tests for Custom Commands

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HelloCommand } from './src/commands/HelloCommand.js';
import { Input } from '@ecfjs/cli';

test('HelloCommand greets by name', async () => {
  const cmd    = new HelloCommand();
  const input  = new Input({ name: 'Alice' }, {}, []);
  const lines  = [];
  const output = { success: (m) => lines.push(m), line: () => {}, error: () => {} };

  await cmd.handle(input, output);
  assert.match(lines[0], /Alice/);
});
```

---

## 15. Dependency Graph

```
@ecfjs/cli
├── @ecfjs/core        (workspace:*)   — Core framework primitives
├── @ecfjs/database    (workspace:*)   — Used in model stubs
├── @ecfjs/http        (workspace:*)   — Used in request/policy stubs
├── @ecfjs/skeleton    (workspace:*)   — Blueprint templates for `ecf new`
└── @ecfjs/view        (workspace:*)   — SSR view layer (referenced by ssr blueprint)

Node.js Built-ins Used:
├── node:fs            — File system (read, write, mkdir, exists, copyFile)
├── node:path          — Path joining and resolution
├── node:readline      — Interactive CLI prompts (Prompts class)
└── node:module        — createRequire (for skeleton resolution in EcfNewCommand)
```

**Runtime vs Dev Dependencies:**

| Dependency | Type | Reason |
|---|---|---|
| `@ecfjs/core` | runtime | Framework primitives |
| `@ecfjs/database` | runtime | Model stub imports |
| `@ecfjs/http` | runtime | Request/policy stub imports |
| `@ecfjs/skeleton` | runtime | Blueprint copy source for `ecf new` |
| `@ecfjs/view` | runtime | SSR blueprint support |
| `node:test` | dev (built-in) | Test runner |
| `node:assert` | dev (built-in) | Test assertions |

---

## 16. Dependency Rules & Constraints

> These rules are enforced by architecture convention in the ECF monorepo.

1. **CLI must NOT import internal subpaths of other packages.** Only public `index.js` exports are allowed.

   ```js
   // ✅ Correct
   import { Model } from '@ecfjs/database';

   // ❌ Forbidden
   import { Model } from '@ecfjs/database/src/orm/Model.js';
   ```

2. **No third-party CLI framework dependencies.** The kernel (kernel/, output/) uses only Node.js built-ins. This keeps the package lightweight and avoids version churn.

3. **Commands must be async.** The `handle(input, output)` method must always be declared `async` (or return a Promise) so that `CliApplication.run()` can `await` it uniformly.

4. **Exit codes are the contract between the CLI and the OS.** Commands should not call `process.exit()` directly. Instead, throwing an `Error` causes `CliApplication.run()` to return `1`.

5. **Generators must be pure.** `CodeGenerator.generate()` with `dryRun: true` must never produce side effects. This is enforced by tests.

---

*This document was generated from the source code at `packages/cli/` in the ECF monorepo.*  
*Last updated: August 2026 — `@ecfjs/cli` v1.0.0-rc.9*
