# `@ecf/console` — Artisan-Style Console Kernel

`@ecf/console` is the Artisan-style console command kernel for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **ConsoleKernel** — command registration and dispatch lifecycle
- **CommandBus** — synchronous and queued command execution
- **SignatureParser** — CLI argument and option parsing
- **PromptsEngine** — interactive CLI prompts
- **CommandAutoDiscoverer** — automatic command discovery from directories
- **LockManager** — prevents concurrent command execution

---

## Quick Start

```javascript
import { Command, ConsoleKernel } from "@ecf/console";

class HelloCommand extends Command {
  signature = "hello {name}";
  description = "Say hello";

  async handle(input, output) {
    output.info(`Hello, ${input.argument("name")}!`);
  }
}

const kernel = new ConsoleKernel();
kernel.register(HelloCommand);
await kernel.handle(["hello", "ECF"]);
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
