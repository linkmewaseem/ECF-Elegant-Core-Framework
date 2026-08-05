# `@ecfjs/devkit` — Enterprise DevKit & Generator Platform

`@ecfjs/devkit` is the official developer experience and code scaffolding platform for ECF (Enterprise Core Framework). Combining the best features of Laravel Artisan, Symfony Maker, Nest CLI, and Rails Generators, `@ecfjs/devkit` provides project scaffolding (`ecf new`), complete code generators (`ecf make:*`), AST-based code injection, YAML Blueprint scaffolder (`ecf blueprint`), third-party package scaffolding & quality validation (`ecf make:package`, `ecf validate`), clean architecture enforcement (`ecf architecture`), project inspection (`ecf inspect`), package installation (`ecf install`), system diagnostics (`ecf doctor`), upgrade assistant (`ecf upgrade`), stub publishing (`ecf stub:publish`), and AI-ready generator abstractions.

---

## 🌟 Key Features

- **Project Scaffolder**: `ecf new [app-name]` with interactive presets (`api`, `web`, `monolith`).
- **Complete Generator Suite**: `make:model`, `make:controller`, `make:resource`, `make:middleware`, `make:migration`, `make:event`, `make:listener`, `make:job`, `make:mail`, `make:notification`, `make:seeder`, `make:test`, `make:channel`, `make:policy`, `make:command`.
- **AST-Based Code Injection**: Modifies `config/app.js`, `routes/web.js`, `.env`, and `package.json` using AST manipulation instead of regex.
- **YAML Blueprint Engine**: `ecf blueprint blog.yaml` compiles a single YAML specification into a full feature stack in one command.
- **Third-Party Package Engine**: `ecf make:package [name]` scaffolds packages adhering to ECF 10/10 architecture standards, and `ecf validate [name]` verifies compliance.
- **Architecture Validator**: `ecf architecture` enforces clean module boundaries.
- **Project Inspector**: `ecf inspect` checks dead routes, unused services, and circular dependencies.
- **Stub Publishing**: `ecf stub:publish` exports customizable template stubs into `stubs/`.
- **Diagnostics & Upgrade**: `ecf doctor` performs comprehensive system health checks and `ecf upgrade` provides version compatibility guidance.

---

## 📄 License

MIT Licensed.
