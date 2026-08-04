# @ecf/support — Package Architecture

`@ecf/support` provides foundational collection and string utilities for the ECF ecosystem.

## Core Components

- **`Collection`**: Fluent, chainable array wrapper with map/filter/reduce operations.
- **`LazyCollection`**: Generator-based lazy collection for large datasets.
- **`Str`**: String transformation utilities (case conversion, slugging, truncation).
- **`Arr`**: Array manipulation helpers.
- **`Macroable`**: Mixin enabling runtime method registration on classes.
- **`Fluent`**: Chainable value object wrapper.

## Dependencies

- Zero dependencies on other ECF packages.

## Dependency Rules

- MUST remain dependency-free to serve as a leaf utility package for all other packages.
