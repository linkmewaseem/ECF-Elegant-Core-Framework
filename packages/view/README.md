# `@ecf/view` — AST View Engine

`@ecf/view` is the high-performance AST-based view compilation and rendering engine for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **ViewEngine** — directive-based template compilation
- **AST Compiler** — lexer, parser, and node visitor pipeline
- **CompiledTemplate Cache** — sub-10ms compile with token caching
- **Layout System** — `@extends`, `@section`, `@yield` directives
- **Expression Evaluator** — safe template expression evaluation
- **HTTP Integration** — `response.view()` rendering via `@ecf/http`

---

## Quick Start

```javascript
import { ViewEngine } from "@ecf/view";

const engine = new ViewEngine({ viewsPath: "./resources/views" });
const html = await engine.render("welcome", { name: "Alice" });
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture
- [BENCHMARKS.md](./BENCHMARKS.md) — compile and render performance SLAs

---

## License

MIT
