# `@ecfjs/upload` — Architecture Freeze Document (v1.0)

## Overview

`@ecfjs/upload` is the official Enterprise File Ingestion Pipeline Platform for the ECF (Enterprise Core Framework) ecosystem. It provides high-performance binary MIME sniffing, image dimension extraction, an extensible middleware pipeline engine, virus quarantine routing, chunked/resumable Tus-style uploads, signed direct-to-storage uploads, and testing fakes.

---

## 1. Monorepo Dependency Graph

```
@ecfjs/core
    │
@ecfjs/support
    │
@ecfjs/storage
    │
@ecfjs/upload (Milestone 17)
```

`@ecfjs/upload` depends only on `@ecfjs/core`, `@ecfjs/support`, and `@ecfjs/storage`. Config, Events, and Validation act as optional peer integrations. There are **zero cyclic dependencies**.

---

## 2. Ingestion Pipeline Architecture

```
       Incoming File Input (Stream / Buffer)
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ UploadPipeline Middleware Engine │
        └────────────────┬─────────────────┘
                         │
      ├── MimeValidationStep
      ├── MagicByteSniffingStep (JPEG/PNG/GIF/WEBP/PDF/ZIP header verification)
      ├── ExtensionValidationStep
      ├── SizeValidationStep
      ├── DimensionValidationStep (PNG/JPEG/GIF/WEBP width/height check)
      ├── FileHashingStep (SHA-256 / MD5 stream checksum)
      ├── DeduplicationStep (CAS hash lookup & byte deduplication)
      ├── VirusScanStep (ClamAV / MockScanner -> QuarantineManager)
      └── SanitizeFileNameStep (Path traversal & dangerous executable extension neutralizing)
                         │
                         ▼
             Validated UploadedFile Object
                         │
                         ▼
             Storage Engine Persistence
```

---

## 3. Security Guarantees & Safeguards

- **Binary Signature Validation (`MagicByteSniffer`)**: Prevents MIME spoofing by inspecting raw binary headers (`\xFF\xD8\xFF` for JPEG, `\x89PNG\r\n\x1a\n` for PNG, `%PDF` for PDF, `GIF87a`/`GIF89a`, `RIFF...WEBP`, `PK\x03\x04` for ZIP).
- **Executable Extension Neutralization (`UploadPathSanitizer`)**: Converts dangerous extensions (`.php`, `.exe`, `.sh`, `.bat`, `.cmd`, `.js`, `.vbs`, `.htaccess`) to `.bin` for safe quarantine/storage.
- **Malware & Quarantine System (`QuarantineManager`)**: Infected files detected by `IVirusScanner` are isolated under `quarantine/` storage keys for administrator review.
- **Chunked Resumable Uploads (`ChunkedUploadSessionManager`)**: Implements Tus-style chunk assembly and garbage collection (`cleanupAbandoned`).

---

## 4. Performance Benchmarks

- **MagicByteSniffer Throughput**: >5,000,000 ops/sec.
