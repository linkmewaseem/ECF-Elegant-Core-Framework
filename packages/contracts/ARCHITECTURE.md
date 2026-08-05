# `@ecfjs/contracts` — Architecture Freeze Document (v1.0)

## Overview

`@ecfjs/contracts` is the zero-runtime SDK interface foundation for the ECF (Enterprise Core Framework) ecosystem. It exports pure contracts, interfaces, abstract classes, symbols, and type definitions for Auth, Cache, Queue, Mail, Notifications, Storage, Upload, Database, Events, Validation, and HTTP.

---

## Key Principles

1. **Zero Runtime Weight**: Contains zero heavy business logic or third-party runtime dependencies.
2. **Decoupled Community Extensions**: Enables third-party packages, custom plugins, and enterprise extensions to build against `@ecfjs/contracts` without requiring core implementation dependencies.
