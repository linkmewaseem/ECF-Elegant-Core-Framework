# @ecf/view — Package Architecture

`@ecf/view` is the high-performance AST template engine for the ECF ecosystem.

## Core Components
- **`Lexer` & `Tokenizer`**: Template token stream extractor.
- **`AST Parser`**: Structural directive parser (`@if`, `@for`, `@switch`, `@component`, `@push`, `@once`).
- **`ExpressionEngine`**: Expression parser & evaluator.
- **`ViewCache`**: Template hash cache with child view dependency tracking.
- **`Renderer`**: Streaming and static HTML string generator.
