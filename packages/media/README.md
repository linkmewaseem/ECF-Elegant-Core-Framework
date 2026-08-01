# @ecf/media

> Enterprise Media Processing Platform for the ECF ecosystem.

`@ecf/media` is not a simple image resize library — it is a complete **media ingestion, transformation, optimization, and storage pipeline** with middleware-based processing, plugin driver registry, media profiles, variant engine, responsive images, and full security hardening.

---

## Installation

```bash
pnpm add @ecf/media --filter my-app

# Optional: sharp for production image processing
pnpm add sharp --filter my-app
```

---

## Quick Start

### Image Processing

```javascript
import { Media } from '@ecf/media';

// Resize, convert to WebP, strip metadata, store to S3
const result = await Media.image(uploadedFile)
    .resize(800, 600)
    .fit("cover")
    .webp({ quality: 85 })
    .stripMetadata()
    .store("products/images", "s3");

console.log(result.storedPath);    // "products/images/photo.webp"
console.log(result.variants);      // {}
```

### Using Media Profiles

```javascript
// Built-in profiles: product, avatar, hero, banner
const result = await Media.image(uploadedFile)
    .profile("product")
    .store("products", "s3");

// result.variants → { thumbnail, medium, large }
```

### Custom Profiles

```javascript
Media.defineProfile("blog-hero")
    .addVariant("mobile", { width: 768, fit: "cover" })
    .addVariant("desktop", { width: 1440, fit: "cover" })
    .format("webp")
    .quality(85)
    .stripMetadata(true);

const result = await Media.image(file)
    .profile("blog-hero")
    .store("blog/images", "local");
```

### Variant Engine

```javascript
const result = await Media.image(uploadedFile)
    .variant("thumbnail", { width: 200, height: 200, fit: "cover" })
    .variant("medium", { width: 600 })
    .variant("large", { width: 1200 })
    .webp({ quality: 82 })
    .store("avatars", "local");

// result.variants → { thumbnail: { path, width, height, size, format }, medium: {...}, large: {...} }
```

### Responsive Images

```javascript
const result = await Media.image(uploadedFile)
    .responsive()  // auto-generates: 320w, 640w, 768w, 1024w, 1280w, 1440w, 1920w
    .store("images/hero", "s3");

// result.allVariantNames() → ["320w", "640w", "768w", "1024w", "1280w", "1440w", "1920w"]
```

### Background Queue Processing

```javascript
// Non-blocking — dispatches to @ecf/queue
await Media.image(uploadedFile)
    .resize(1920, 1080)
    .profile("hero")
    .queueOn("media-processing");
```

### Watermark

```javascript
import { readFileSync } from 'node:fs';
const logo = readFileSync('./assets/logo.png');

await Media.image(file)
    .resize(1200, 630)
    .watermark(logo, { gravity: "southeast" })
    .webp({ quality: 90 })
    .store("og-images", "local");
```

### Metadata Extraction

```javascript
const metadata = await Media.metadata(uploadedFile);
console.log(metadata.width, metadata.height);   // 1920, 1080
console.log(metadata.exif.make);                // "Canon"
console.log(metadata.exif.iso);                 // 400
console.log(metadata.gps.latitude);             // 51.5074
console.log(metadata.hasGps());                 // true
console.log(metadata.isLandscape());            // true
```

### Optimization Profiles

```javascript
await Media.image(file).optimize("web").store("images", "s3");
// "web"       → WebP quality:82
// "archive"   → PNG lossless
// "thumbnail" → WebP nearLossless
// "print"     → TIFF lzw
```

---

## Plugin Driver Registry

Register community drivers to swap the processing engine:

```javascript
import { Media } from '@ecf/media';
import { CloudinaryDriver } from '@acme/ecf-cloudinary';
import { ImagickDriver } from '@acme/ecf-imagick';

// Register
Media.extend("cloudinary", new CloudinaryDriver({ apiKey: "..." }));
Media.extend("imagick", new ImagickDriver());

// Switch default
Media.useImageDriver("cloudinary");

// Or per-call override
await Media.image(file, "imagick").resize(800, 600).store("images", "local");
```

---

## Processing Pipeline (Middleware API)

For advanced control, use the middleware-based pipeline:

```javascript
import { MediaPipeline } from '@ecf/media';

const pipeline = new MediaPipeline();
pipeline
    .use(new StripMetadataStage())
    .use(new ResizeStage(800, 600))
    .use(new WatermarkStage(logo))
    .use(new CompressStage());

const ctx = { buffer: Buffer.from("...") };
await pipeline.run(ctx);
// ctx.trace → [{ stage: "StripMetadataStage", durationMs: 2 }, ...]
```

---

## Security

All input passes through `MediaSecurityValidator`:

| Threat | Protection |
| :--- | :--- |
| Pixel Bomb | Max 256MP total pixel count |
| Memory Exhaustion | Max 1GB estimated decompressed canvas |
| Zip Bomb | Max 10,000:1 compression ratio |
| Animated GIF Abuse | Max 256 frames |
| SVG XSS | Rejects `<script>`, `on*=` handlers, external hrefs |
| SVG XXE | Rejects DOCTYPE/ENTITY declarations |
| SVG HTML Injection | Rejects `<foreignObject>` |
| Oversized Files | Max 500MB per file |

---

## Testing

```javascript
import { MediaTestingFake } from '@ecf/media';

const fake = MediaTestingFake.create();
const manager = new MediaManager();
manager.extend("fake", fake.getFakeDriver());
manager.useImageDriver("fake");

await manager.driver("fake").process(file, [
    { type: "resize", args: [200, 200, {}] },
    { type: "webp",   args: [{}] },
    { type: "stripMetadata", args: [] },
]);

fake.assertProcessed();
fake.assertResized(200, 200);
fake.assertFormat("webp");
fake.assertMetadataStripped();
fake.assertWatermarked();   // ← would fail, watermark not applied
```

**Assert methods:** `assertProcessed(n?)`, `assertNotProcessed()`, `assertHasTransformation(type)`, `assertResized(w, h)`, `assertFormat(fmt)`, `assertMetadataStripped()`, `assertWatermarked()`, `assertGrayscale()`, `assertBlurred()`, `assertVariant(name)`, `assertStoredIn(dir)`, `assertVariantCount(n)`, `callCount()`, `reset()`, `getCalls()`

---

## Service Provider Registration

```javascript
import { MediaServiceProvider } from '@ecf/media';

app.register(MediaServiceProvider);
```

Auto-detects and wires `@ecf/storage`, `@ecf/queue`, and `@ecf/events` if registered.

---

## AI-Ready Contracts

Future `@ecf/ai` integration:

```javascript
import { IBackgroundRemover, IFaceDetector } from '@ecf/media';

class ReplicateBackgroundRemover extends IBackgroundRemover {
    async remove(buffer, options) { /* ... */ }
}
```

Available: `IImageAnalyzer`, `IBackgroundRemover`, `ICaptionGenerator`, `IFaceDetector`, `IObjectDetector`, `IContentModerator`, `ISmartCropper`

---

## Events

| Event | Fired When |
| :--- | :--- |
| `MediaLoaded` | Source file loaded into MediaFile |
| `MediaValidated` | Security validation passed |
| `MediaTransforming` | Transformation pipeline started |
| `MediaOptimized` | Optimization step complete |
| `MediaEncoded` | Format encoding complete |
| `MediaStored` | Output written to storage |
| `MediaProcessed` | Full pipeline complete with MediaResult |
| `MediaFailed` | Any processing step failed |
| `MediaDeleted` | Media file deleted from storage |

---

## License

MIT — Part of the ECF Ecosystem.
