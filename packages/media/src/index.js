// ─── Core Value Objects ───────────────────────────────────────────────────────
export { MediaFile } from './core/MediaFile.js';
export { MediaMetadata } from './core/MediaMetadata.js';
export { MediaResult } from './core/MediaResult.js';

// ─── Contracts ────────────────────────────────────────────────────────────────
export { IMediaDriver } from './contracts/IMediaDriver.js';
export { IImageProcessor } from './contracts/IImageProcessor.js';
export { IMediaOptimizer } from './contracts/IMediaOptimizer.js';
export {
  IImageAnalyzer,
  IBackgroundRemover,
  ICaptionGenerator,
  IFaceDetector,
  IObjectDetector,
  IContentModerator,
  ISmartCropper,
} from './contracts/IAiContracts.js';

// ─── Exceptions ───────────────────────────────────────────────────────────────
export {
  MediaException,
  UnsupportedMediaTypeException,
  MediaDriverNotFoundException,
  MediaProcessingException,
  MediaSecurityException,
  MediaStorageException,
  MediaValidationException,
  ProfileNotFoundException,
  VariantNotFoundException,
} from './exceptions/MediaException.js';

// ─── Profiles & Variants ──────────────────────────────────────────────────────
export { MediaProfile, BuiltInProfiles } from './profiles/MediaProfile.js';
export { ProfileRegistry } from './profiles/ProfileRegistry.js';

// ─── Pipeline ─────────────────────────────────────────────────────────────────
export { MediaPipeline, PipelineStage } from './pipeline/MediaPipeline.js';

// ─── Security ─────────────────────────────────────────────────────────────────
export { MediaSecurityValidator } from './security/MediaSecurityValidator.js';

// ─── Image Engine ─────────────────────────────────────────────────────────────
export { ImageProcessor } from './image/ImageProcessor.js';

// ─── Drivers ─────────────────────────────────────────────────────────────────
export { NullDriver } from './drivers/NullDriver.js';
export { SharpDriver } from './drivers/SharpDriver.js';

// ─── Events ───────────────────────────────────────────────────────────────────
export {
  MediaLoadedEvent,
  MediaValidatedEvent,
  MediaTransformingEvent,
  MediaOptimizedEvent,
  MediaEncodedEvent,
  MediaStoredEvent,
  MediaProcessedEvent,
  MediaFailedEvent,
  MediaDeletedEvent,
} from './events/MediaEvents.js';

// ─── Queue ────────────────────────────────────────────────────────────────────
export { ProcessMediaJob } from './queue/ProcessMediaJob.js';

// ─── Internal (MediaManager) ──────────────────────────────────────────────────
export { MediaManager } from './internal/MediaManager.js';

// ─── Facades ──────────────────────────────────────────────────────────────────
export { MediaFacade, Media } from './facades/MediaFacade.js';

// ─── Providers ────────────────────────────────────────────────────────────────
export { MediaServiceProvider } from './providers/MediaServiceProvider.js';

// ─── Testing ──────────────────────────────────────────────────────────────────
export { MediaTestingFake } from './testing/MediaTestingFake.js';
