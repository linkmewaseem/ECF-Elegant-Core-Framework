# Contributing to ECF

Thank you for considering contributing to ECF (Enterprise Core Framework)!

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/ecf/ecf.git
   cd ecf
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run unit tests across all workspace packages:
   ```bash
   pnpm test
   ```

## Architecture Standards

All packages in the ECF repository follow a strict 10/10 architectural pattern:
- `Contracts ➔ Manager ➔ Drivers ➔ Facade ➔ Service Provider ➔ Testing Fake ➔ DevTools Collector ➔ README ➔ ARCHITECTURE.md ➔ Tests`.

## Pull Request Guidelines

- Ensure all existing unit tests pass (`pnpm test`).
- Add comprehensive unit tests for any new features or bug fixes.
- Follow ES Module conventions.
- Do not introduce breaking API changes after `1.0.0-rc.1` freeze.
