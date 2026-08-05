# Architecture Decision Record (ADR) — `@ecfjs/devkit`

## Status
Approved & Implemented

## Context
ECF required a cohesive, production-grade developer experience platform for code generation, project scaffolding, automated package installation, architecture boundary validation, and project inspection.

## Decisions

1. **AST Injection Engine**: Code modification uses AST manipulation (`ASTInjector`) rather than regex replacement to preserve formatting and prevent syntax errors when updating configuration, route, or environment files.
2. **Declarative Blueprint Scaffolder**: `BlueprintCompiler` translates single-file YAML/JSON specifications into full feature stacks (Model, Migration, Controller, Resource, Policy, Test).
3. **10/10 Package Architecture Standardization**: `PackageScaffolder` and `PackageValidator` enforce ECF's standard architecture (`Contracts ➔ Manager ➔ Drivers ➔ Facade ➔ Service Provider ➔ Testing Fake ➔ DevTools Collector ➔ README ➔ ARCHITECTURE.md`) for all community packages.
4. **Architecture Validator**: `ArchitectureValidator` scans application source code for boundary violations (e.g., HTTP layer directly referencing database drivers).
5. **AI-Ready Abstraction**: `AIStubGenerator` establishes the prompt and template abstraction layer for Milestone 30 `@ecfjs/ai`.

## Consequences
Provides ECF with an extensible DX engine matching or exceeding Laravel Artisan, Symfony Maker, and Nest CLI.
