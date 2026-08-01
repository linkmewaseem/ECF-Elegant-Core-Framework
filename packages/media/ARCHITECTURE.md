# @ecf/media — Architecture Documentation

## Overview

`@ecf/media` is an **Enterprise-grade Media Processing Platform** for the ECF ecosystem.
It is not a simple image resize wrapper — it is a complete media ingestion, transformation, optimization, and storage pipeline.

---

## Architecture

### Full Pipeline

```text
Source (Buffer | Path | UploadedFile)
    │
    ▼
MediaFile (Core Value Object)
    │
    ├── Security Validation ─────────────────────────────────────────
    │   MediaSecurityValidator
    │   ├── File size check (max 500MB)
    │   ├── Pixel bomb detection (max 256MP)
    │   ├── Canvas memory exhaustion check (max 1GB decompressed)
    │   ├── Animated frame limit (max 256 frames)
    │   ├── Zip bomb ratio check
    │   └── SVG sanitization (script, event handler, external ref, foreignObject, DOCTYPE)
    │
    ├── Processing Pipeline (MediaPipeline — middleware-based)
    │   ├── Stage: Load
    │   ├── Stage: Validate
    │   ├── Stage: Decode
    │   ├── Stage: Transform → ImageProcessor / VideoProcessor / AudioProcessor
    │   ├── Stage: Optimize
    │   ├── Stage: Encode
    │   └── Stage: Store → @ecf/storage
    │
    ├── Driver Layer (Plugin Registry)
    │   ├── SharpDriver (sharp — native image processing)
    │   ├── NullDriver (zero-dependency passthrough)
    │   └── [Community Drivers] (Media.extend("cloudinary", new CloudinaryDriver()))
    │
    ├── Variant Engine
    │   ├── Named variants (thumbnail, medium, large)
    │   └── Responsive breakpoints (320w, 640w, 768w, 1024w, 1280w, 1440w, 1920w)
    │
    ├── Profile System
    │   ├── MediaProfile (declarative processing configuration)
    │   ├── ProfileRegistry (named lookup)
    │   └── Built-in profiles: product, avatar, hero, banner
    │
    ├── Queue Integration (@ecf/queue)
    │   └── ProcessMediaJob (background processing for heavy operations)
    │
    ├── Events (@ecf/events)
    │   ├── MediaLoaded → MediaValidated → MediaTransforming → MediaOptimized
    │   └── MediaEncoded → MediaStored → MediaProcessed | MediaFailed | MediaDeleted
    │
    └── Storage (@ecf/storage)
         └── Writes primary + all variant outputs to configured disk
```

---

## Module Map

```
packages/media/src/
 ├── contracts/
 │    ├── IMediaDriver.js         ← base driver interface
 │    ├── IImageProcessor.js      ← image processing interface
 │    ├── IMediaOptimizer.js      ← optimizer interface
 │    └── IAiContracts.js         ← AI-ready: IImageAnalyzer, IBackgroundRemover, IFaceDetector...
 ├── core/
 │    ├── MediaFile.js            ← value object: wraps any input source
 │    ├── MediaMetadata.js        ← full EXIF/GPS/ICC/video codec metadata
 │    └── MediaResult.js          ← immutable output: path, variants, metadata, trace
 ├── exceptions/
 │    └── MediaException.js       ← full exception hierarchy (8 types)
 ├── security/
 │    └── MediaSecurityValidator.js  ← pixel bomb, zip bomb, SVG, canvas, size
 ├── pipeline/
 │    └── MediaPipeline.js        ← middleware pipeline with DevTools trace
 ├── image/
 │    └── ImageProcessor.js       ← fluent builder (15+ methods)
 ├── drivers/
 │    ├── SharpDriver.js          ← production image driver
 │    └── NullDriver.js           ← testing / CI passthrough
 ├── profiles/
 │    ├── MediaProfile.js         ← declarative profile + built-in presets
 │    └── ProfileRegistry.js      ← named profile lookup
 ├── events/
 │    └── MediaEvents.js          ← 9 lifecycle events
 ├── queue/
 │    └── ProcessMediaJob.js      ← @ecf/queue job for background processing
 ├── internal/
 │    └── MediaManager.js         ← driver registry + profile registry + factory
 ├── facades/
 │    └── MediaFacade.js          ← static Media.image() / Media.extend() proxy
 ├── providers/
 │    └── MediaServiceProvider.js ← registers into ECF container
 └── testing/
      └── MediaTestingFake.js     ← 14 assert methods, no native addons needed
```

---

## Driver Plugin System

`@ecf/media` uses an **open driver registry** — any third-party package can register a custom driver:

```javascript
// Community driver example
import { Media } from '@ecf/media';
import { CloudinaryDriver } from '@acme/ecf-cloudinary';

Media.extend("cloudinary", new CloudinaryDriver({ apiKey: "..." }));
Media.useImageDriver("cloudinary");
```

Built-in drivers:

| Driver | Description |
| :--- | :--- |
| `sharp` | Production image processing via `sharp` native addon |
| `null` | Zero-dependency passthrough — for testing and CI |

---

## Profiles API

```javascript
// Use built-in profile
await Media.image(file).profile("product").store("products", "s3");

// Define custom profile
Media.defineProfile("blog-header")
    .addVariant("sm", { width: 640, fit: "cover" })
    .addVariant("lg", { width: 1280, fit: "cover" })
    .format("webp")
    .quality(85)
    .stripMetadata(true);

await Media.image(file).profile("blog-header").store("blog/images", "local");
```

Built-in profiles: `product`, `avatar`, `hero`, `banner`

---

## Fluent API Summary

```javascript
await Media.image(uploadedFile)
    .resize(800, 600)            // Resize to exact dimensions
    .fit("cover")                // Fit mode: cover | contain | fill | inside | outside
    .crop(x, y, w, h)           // Crop region
    .rotate(90)                  // Rotate with background fill
    .flip()                      // Vertical flip
    .flop()                      // Horizontal flip
    .blur(3)                     // Gaussian blur
    .sharpen()                   // Sharpen
    .grayscale()                 // Grayscale conversion
    .sepia()                     // Sepia tone
    .watermark(logo, { gravity: "southeast" })  // Watermark composite
    .canvas(1200, 630, "#ffffff") // Extend canvas
    .webp({ quality: 82 })       // WebP output
    .avif({ quality: 50 })       // AVIF output
    .jpeg({ quality: 90 })       // JPEG output
    .png({ compressionLevel: 9 }) // PNG output
    .optimize("web")             // Smart optimization preset
    .stripMetadata()             // Remove EXIF/GPS/ICC data
    .variant("thumb", { width: 200, height: 200, fit: "cover" })
    .variant("large", { width: 1200 })
    .responsive()                // Auto-generate 7 responsive breakpoints
    .store("images/products", "s3");
```

---

## Security Model

All media inputs pass through `MediaSecurityValidator` before processing:

| Threat | Detection Method | Default Limit |
| :--- | :--- | :--- |
| Pixel Bomb | Total pixel count check | 256MP |
| Memory Exhaustion | Estimated decompressed canvas size | 1GB |
| Zip Bomb | Compressed-to-canvas ratio | 10,000:1 |
| Animated Abuse | Frame count limit | 256 frames |
| SVG XSS | Regex: `<script>`, `on*=`, external href | Rejected |
| SVG XXE | DOCTYPE/ENTITY detection | Rejected |
| SVG HTML Injection | `<foreignObject>` detection | Rejected |
| Oversized Files | Raw file size limit | 500MB |

---

## AI-Ready Contracts

`@ecf/media` ships zero-implementation AI contracts for future `@ecf/ai` integration:

```javascript
import { IImageAnalyzer, IBackgroundRemover, IFaceDetector } from '@ecf/media';

// Future usage (Phase 21C / @ecf/ai)
class ReplicateBackgroundRemover extends IBackgroundRemover {
    async remove(buffer, options) { /* ... */ }
}
```

Contracts: `IImageAnalyzer`, `IBackgroundRemover`, `ICaptionGenerator`, `IFaceDetector`, `IObjectDetector`, `IContentModerator`, `ISmartCropper`

---

## Performance Benchmarks

Measured on Node.js v22 (no native sharp addon, using NullDriver/Fake):

| Operation | Throughput |
| :--- | :--- |
| NullDriver.process() | >30,000 ops/sec |
| MediaTestingFake.process() | >16,000 ops/sec |
| 5-stage MediaPipeline | >4,000 runs/sec |
| MediaFile.fromBuffer() | >384,000 creates/sec |
| MediaManager new | >8,000 creates/sec |

---

## Governance Checklist (Architecture Freeze v1.0)

| Rule | Status |
| :--- | :--- |
| Zero cyclic dependencies | ✅ |
| Contracts-first design | ✅ |
| Event & Queue integration | ✅ |
| Testing Fake harness | ✅ (14 assert methods) |
| Security review | ✅ (8 threat classes covered) |
| Performance benchmarks | ✅ (>1,000 ops/sec on all paths) |
| DevTools hooks | ✅ (9 events + pipeline trace) |
| Full documentation | ✅ (ARCHITECTURE.md + README.md) |
| AI-ready contracts | ✅ (7 future interfaces) |
| SemVer API freeze | ✅ (v1.0.0-rc.1) |
