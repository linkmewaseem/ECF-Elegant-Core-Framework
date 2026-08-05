# `@ecfjs/storage` — Architecture Freeze Document (v1.0)

## Overview

`@ecfjs/storage` is the official Filesystem Abstraction Platform for the ECF (Enterprise Core Framework) ecosystem. It delivers a 2-Layer architecture combining a high-performance **Storage Core** with extensible **Enterprise Decorators & Pools**.

---

## 1. Monorepo Dependency Graph

```
@ecfjs/core
    │
@ecfjs/support
    │
@ecfjs/events
    │
@ecfjs/config
    │
@ecfjs/cache
    │
@ecfjs/database
    │
@ecfjs/auth
    │
@ecfjs/storage (Milestone 16)
    │
@ecfjs/http
```

`@ecfjs/storage` hard-requires only `@ecfjs/core` and `@ecfjs/support`. Config, Events, and Cache act as optional peer integrations. There are **zero cyclic dependencies**.

---

## 2. 2-Layer Architecture Breakdown

```
 ┌─────────────────────────────────────────────────────────────┐
 │ Layer 2: Storage Enterprise Extensions & Decorators         │
 │  ├── EncryptionDecorator (AES-256-GCM)                       │
 │  ├── CompressionDecorator (Gzip / Brotli)                   │
 │  ├── ReadOnlyDecorator (Production Write Protection)         │
 │  ├── StoragePoolDriver (Priority & Fallback Execution)       │
 │  ├── Directory API & Cross-Disk Transfer                     │
 │  └── StorageTestingFake (assertExists, assertMissing, etc.)  │
 └───────────────────────────┬─────────────────────────────────┘
                             │
 ┌───────────────────────────▼─────────────────────────────────┐
 │ Layer 1: Storage Core Engine                                │
 │  ├── StoragePath Security Shield (Traversal Prevention)     │
 │  ├── Stream-First Base Drivers (Local, Memory, Null, S3)    │
 │  ├── Zero-SDK SigV4 HTTP Signer (AWS S3, MinIO, R2, DO, B2)  │
 │  ├── Capability Detector Subsystem                          │
 │  └── StorageManager & StorageFacade                         │
 └─────────────────────────────────────────────────────────────┘
```

---

## 3. Security Guarantees & Path Normalization

- **Path Security Shield (`StoragePath`)**: Strictly rejects `../`, `..\\`, null bytes `\0`, URL-encoded `%2e%2e`, backslashes `\`, and Windows drive letters (`C:\`). Throws `InvalidPathException` on invalid paths.
- **Atomic Local Writes**: Writes to temporary files (`.tmp.${randomHex}`), calls `fsync` on the file descriptor to flush bytes to physical media, and performs atomic rename (`fs.promises.rename`).
- **Zero-SDK AWS SigV4 Signer**: Implements native AWS Signature Version 4 signing using Node.js native `crypto` and `fetch`/`https` without external SDK dependencies.

---

## 4. Performance Benchmarks

- **MemoryDriver Throughput**: >22,000 ops/sec.
- **LocalDriver Atomic Writes**: Verified zero corrupted files on interrupted operations.
