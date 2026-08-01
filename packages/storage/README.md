# `@ecf/storage` — Enterprise Filesystem Abstraction Platform

`@ecf/storage` is a powerful, stream-first filesystem abstraction platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- 📁 **Multi-Driver Abstraction**: Local, Memory, Null, S3-Compatible (AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2 S3).
- 🛡️ **Path Security Shield**: Prevents path traversal (`../`, `%2e%2e`, `\0`, `C:\`) via `StoragePath`.
- ⚡ **Stream-First & Atomic Local Writes**: `readStream()`, `writeStream()`, `fsync`, and atomic file renames.
- 🎨 **Decorator Pipeline**: Transparent AES-256-GCM `EncryptionDecorator`, Gzip `CompressionDecorator`, and write-protecting `ReadOnlyDecorator`.
- 🏊 **Storage Pools**: Failover priority execution across multiple storage disks.
- 🧪 **Testing Fake Harness**: `Storage.fake('avatars')` with `assertExists()`, `assertMissing()`, `assertCount()`, `assertChecksum()`, `assertVisibility()`.
- 🌐 **Zero External Dependencies**: Native SigV4 AWS S3 signer using standard Node.js `crypto` & `fetch`.

---

## Quick Start

### 1. Basic Operations

```javascript
import { Application } from "@ecf/core";
import { StorageServiceProvider, Storage } from "@ecf/storage";

const app = new Application();
app.register(StorageServiceProvider);
app.boot();

// Write file
await Storage.put("documents/report.pdf", "File contents...");

// Read file
const text = await Storage.get("documents/report.pdf");

// Read stream
const stream = await Storage.readStream("documents/report.pdf");

// Generate temporary URL
const url = await Storage.temporaryUrl("documents/report.pdf", 3600);
```

### 2. Testing Fake

```javascript
import { Storage } from "@ecf/storage";

const fakeDisk = Storage.fake("avatars");
await fakeDisk.put("waseem.png", "image-bytes");

await fakeDisk.assertExists("waseem.png");
await fakeDisk.assertCount(1);
```

---

## License

MIT
