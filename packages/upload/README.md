# `@ecfjs/upload` — Enterprise File Ingestion Pipeline Platform

`@ecfjs/upload` is a robust file ingestion pipeline platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- 🕵️ **Binary Magic Byte Sniffing**: Header signature sniffing for JPEG, PNG, GIF, WEBP, PDF, ZIP, and MP4 without external binary dependencies.
- 📐 **Image Dimension Parser**: Header inspection for width and height extraction.
- 🛡️ **Executable Neutralization**: Prevents path traversal and neutralizes executable extensions (`.exe`, `.php`, `.sh`).
- ☣️ **Virus Scanning & Quarantine**: Pluggable `IVirusScanner` with `QuarantineManager` routing.
- 🧩 **Chunked & Resumable Uploads**: Tus-style chunk session management (`initiate`, `appendChunk`, `assemble`, `cleanupAbandoned`).
- ✍️ **Signed Direct-to-Storage Uploads**: Pre-signed upload URLs for direct S3 / R2 / MinIO client uploads.
- 🧪 **Upload Testing Fake**: `Upload.fake()` and `UploadedFile.fake('avatar.jpg')`.

---

## Quick Start

### 1. Basic Ingestion Pipeline

```javascript
import { Application } from "@ecfjs/core";
import { StorageServiceProvider } from "@ecfjs/storage";
import { UploadServiceProvider, Upload, UploadedFile } from "@ecfjs/upload";

const app = new Application();
app.register(StorageServiceProvider);
app.register(UploadServiceProvider);
app.boot();

// Ingest uploaded file through 'avatar' profile
const rawFile = UploadedFile.fake("profile.jpg", { size: 2048, mime: "image/jpeg" });
const { file, manifest } = await Upload.process(rawFile, "avatar");

// Persist to storage disk
await file.store("avatars", "local");
```

---

## License

MIT
