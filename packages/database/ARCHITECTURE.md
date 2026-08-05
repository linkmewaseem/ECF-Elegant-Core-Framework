# @ecfjs/database — Package Architecture

`@ecfjs/database` is the enterprise ORM and AST QueryBuilder engine for the ECF ecosystem.

## Core Components
- **`Connection` & Drivers**: SQLite, MySQL, and Postgres SQL dialect compilers.
- **`QueryBuilder`**: Immutable AST query mutators (`where`, `join`, `orderBy`, `with`).
- **`Model` & `ModelRepository`**: Hybrid Active Record + Data Mapper ORM with dirty tracking and attribute casting.
- **`RelationPlan`**: Identity Map deduplication and eager loading engine (`hasOne`, `hasMany`, `belongsTo`, `belongsToMany`).
- **Scope Engine**: Global and local scope intelligence.
- **Model Observer**: Event bus for model mutation lifecycle hooks.
